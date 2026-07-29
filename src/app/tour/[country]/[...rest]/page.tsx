import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TourDetailView from "@/components/tours/TourDetailView";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, tourProductJsonLd, absoluteUrl } from "@/lib/jsonld";
import { tourUrl } from "@/lib/tour-url";
import { API_URL, SITE_URL } from "@/lib/config";
import type { TourDetail } from "@/lib/api";
import { stripBrandSuffix } from "@/lib/seo";

const SITE_NAME = "Next Trip Holiday";

/**
 * New canonical tour-detail route. A single catch-all handles both shapes:
 *   /tour/{country}/{slug}          -> rest = [slug]        (tours with no city)
 *   /tour/{country}/{city}/{slug}   -> rest = [city, slug]  (tours with a city)
 * The tour slug is always the LAST catch-all segment.
 */

// Server-side base URL. In production NEXT_PUBLIC_API_URL may be relative
// ("/api") which the server runtime cannot resolve, so prefer API_PROXY_TARGET.
function serverApiBase(): string {
  const base = process.env.API_PROXY_TARGET || API_URL;
  return base.replace(/\/$/, "");
}

/**
 * Fetch tour detail on the server so we can render SSR metadata and
 * schema.org JSON-LD (Product/Offer + BreadcrumbList) in the initial HTML.
 * The client component still fetches for interactive state, so this call
 * is duplicated but cached at the edge (5 min) — a small cost for real SEO.
 */
async function getTourDetail(slug: string): Promise<TourDetail | null> {
  try {
    const res = await fetch(
      `${serverApiBase()}/tours/detail/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as TourDetail) ?? null;
  } catch {
    return null;
  }
}

/** Human-readable Thai country label from the country slug (fallback). */
function countryLabelFromSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

// Per-tour SEO. Canonical always points to the new /tour/{country}/... URL,
// so the legacy /tours/{slug} route (which 308s here) does not compete.
export async function generateMetadata(
  { params }: { params: Promise<{ country: string; rest: string[] }> },
): Promise<Metadata> {
  const { rest } = await params;
  if (!rest || rest.length < 1 || rest.length > 2) return {};
  const slug = rest[rest.length - 1];
  const tour = await getTourDetail(slug);
  if (!tour) return {};

  const path = tourUrl({
    slug: tour.slug,
    country_slug: tour.country_slug,
    city_slug: tour.city_slug,
  });
  const canonical = absoluteUrl(path);
  const rawTitle = tour.meta_title || tour.title;
  const title = stripBrandSuffix(rawTitle);
  const description =
    tour.meta_description ||
    (tour.description
      ? tour.description.replace(/<[^>]+>/g, "").slice(0, 200)
      : undefined);
  const image = tour.cover_image_url || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: canonical,
      siteName: SITE_NAME,
      title: rawTitle,
      description,
      images: image ? [{ url: image, alt: tour.cover_image_alt || tour.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: rawTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function TourDetailByLocationPage({
  params,
}: {
  params: Promise<{ country: string; rest: string[] }>;
}) {
  const { country, rest } = await params;
  if (!rest || rest.length < 1 || rest.length > 2) notFound();
  const slug = rest[rest.length - 1];

  // Fetch on the server for structured data. The client TourDetailView still
  // fetches to hydrate interactive state — a second cached call.
  const tour = await getTourDetail(slug);

  // Build breadcrumb trail: Home > ทัวร์ต่างประเทศ > {Country} [ > {City} ] > {Tour}
  const countryName =
    tour?.primary_country?.name ||
    tour?.countries?.[0]?.name ||
    countryLabelFromSlug(country);
  const cityName =
    rest.length === 2
      ? tour?.cities?.[0]?.name || rest[0].replace(/-/g, " ")
      : null;

  const breadcrumbTrail = [
    { name: "ทัวร์ต่างประเทศ", url: "/tours/international" },
    {
      name: `ทัวร์${countryName}`,
      url: `/tours/country/${tour?.country_slug || country}`,
    },
  ];
  if (cityName && rest.length === 2) {
    breadcrumbTrail.push({
      name: `ทัวร์${cityName}`,
      url: `/tours/city/${rest[0]}`,
    });
  }
  if (tour) {
    breadcrumbTrail.push({
      name: tour.title,
      url: tourUrl({
        slug: tour.slug,
        country_slug: tour.country_slug,
        city_slug: tour.city_slug,
      }),
    });
  }

  const schemas: object[] = [breadcrumbJsonLd(breadcrumbTrail)];
  if (tour) schemas.push(tourProductJsonLd(tour));

  return (
    <>
      <JsonLd data={schemas} />
      <TourDetailView slug={slug} />
    </>
  );
}
