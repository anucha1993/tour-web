/**
 * Canonical tour-detail URL builder.
 *
 * New public URL formats:
 *   `/tour/{country}/{city}/{slug}` — tours linked to a representative city.
 *   `/tour/{country}/{slug}`        — tours with a country but no linked city.
 *
 * When a tour has no country slug available, we fall back to the legacy
 * `/tours/{slug}` path. That legacy route still resolves the tour and
 * 308-redirects to the new format whenever it can determine the country,
 * so links built from partial data keep working.
 */
export interface TourUrlParts {
  slug: string;
  country_slug?: string | null;
  city_slug?: string | null;
}

/** Build the relative tour-detail path (always starts with `/`). */
export function tourUrl(tour: TourUrlParts): string {
  if (tour.country_slug && tour.city_slug) {
    return `/tour/${tour.country_slug}/${tour.city_slug}/${tour.slug}`;
  }
  if (tour.country_slug) {
    return `/tour/${tour.country_slug}/${tour.slug}`;
  }
  return `/tours/${tour.slug}`;
}

/**
 * Build the absolute tour-detail URL for share links, canonical tags,
 * sitemaps and structured data. `base` is the site origin (trailing slash ok).
 */
export function tourAbsoluteUrl(base: string, tour: TourUrlParts): string {
  return `${base.replace(/\/$/, "")}${tourUrl(tour)}`;
}

/**
 * Country listing path. Formerly `/tours/country/{slug}`, now the flat
 * `/tours/{slug}`. The `/tours/{slug}` route auto-detects country-vs-tour.
 */
export function countryUrl(countrySlug: string): string {
  return `/tours/${countrySlug}`;
}

/**
 * City listing path, nested under its country. Formerly `/tours/city/{slug}`,
 * now `/tours/{country}/{city}`.
 */
export function cityUrl(countrySlug: string, citySlug: string): string {
  return `/tours/${countrySlug}/${citySlug}`;
}
