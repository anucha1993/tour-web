import { API_URL } from "@/lib/config";

/**
 * Server-side absolute API base.
 *
 * In production `NEXT_PUBLIC_API_URL` is the relative value `/api`, which the
 * server runtime's `fetch` cannot resolve. `API_PROXY_TARGET` is absolute in
 * every environment (local + prod), so prefer it for server-side requests and
 * only fall back to `API_URL` when it is missing.
 */
function serverApiBase(): string {
  const base = process.env.API_PROXY_TARGET || API_URL;
  return base.replace(/\/$/, "");
}

export interface TourLocation {
  country_slug?: string | null;
  city_slug?: string | null;
}

/**
 * Resolve a `/tours/{slug}` segment against the tour-detail API.
 *
 * Returns the tour's location when `slug` is a real tour, or `null` when it is
 * not a tour (e.g. a country slug) or the request fails. Used by the
 * dual-purpose `/tours/{slug}` route to tell tours and country listings apart.
 */
export async function fetchTourLocation(slug: string): Promise<TourLocation | null> {
  try {
    const res = await fetch(
      `${serverApiBase()}/tours/detail/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as TourLocation) ?? null;
  } catch {
    return null;
  }
}

export interface CountryInfo {
  name_th: string;
  slug: string;
}

/** Look up a country by slug via the international-tours list endpoint. */
export async function fetchCountryInfo(slug: string): Promise<CountryInfo | null> {
  try {
    const res = await fetch(
      `${serverApiBase()}/tours/international?country_slug=${encodeURIComponent(slug)}&per_page=1`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const country = json?.active_filters?.country;
    if (country?.slug) return { name_th: country.name_th, slug: country.slug };
    return null;
  } catch {
    return null;
  }
}

export interface CityInfo {
  name_th: string;
  slug: string;
  country_slug: string | null;
}

/**
 * Look up a city (and its parent country slug) by slug via the list endpoint.
 * The country slug is needed to build the nested `/tours/{country}/{city}` URL.
 */
export async function fetchCityInfo(slug: string): Promise<CityInfo | null> {
  try {
    const res = await fetch(
      `${serverApiBase()}/tours/international?city_slug=${encodeURIComponent(slug)}&per_page=1`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const city = json?.active_filters?.city;
    if (!city?.slug) return null;
    const countries = json?.filters?.countries as
      | { id: number; slug: string }[]
      | undefined;
    const firstTour = (json?.data as { country_slug?: string | null }[] | undefined)?.[0];
    const countrySlug: string | null =
      json?.active_filters?.country?.slug ??
      countries?.find((co) => co.id === city.country_id)?.slug ??
      firstTour?.country_slug ??
      null;
    return { name_th: city.name_th, slug: city.slug, country_slug: countrySlug };
  } catch {
    return null;
  }
}
