// Shared JSON-LD (schema.org) helpers for tour-web.
//
// Notes for SEO integrity:
//   * Every schema built here reflects real, on-page content (no fabricated
//     prices/ratings). Google penalizes structured data that does not match
//     what a user sees on the page.
//   * Prices are only emitted when a real number is available; when a tour has
//     no active offer we skip <offers> entirely rather than guessing.

import { SITE_URL } from "./config";
import { tourUrl } from "./tour-url";
import type { TourDetail } from "./api";

const SITE_NAME = "Next Trip Holiday";

/** Absolute site URL helper (avoids stray double slashes). */
export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

// ─────────────────────────────────────────────────────────────
// BreadcrumbList
// ─────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Human-readable label shown in search results. */
  name: string;
  /** Site-relative path (e.g. `/tours/country/japan`) or absolute URL. */
  url: string;
}

/**
 * Build a schema.org BreadcrumbList JSON-LD object.
 * Prepend a Home entry automatically so callers only need to pass the trail.
 */
export function breadcrumbJsonLd(trail: BreadcrumbItem[]): object {
  const items: BreadcrumbItem[] = [
    { name: "หน้าแรก", url: "/" },
    ...trail,
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Product / Offer (tour detail)
// ─────────────────────────────────────────────────────────────

/**
 * Pick the lowest real price displayed on the tour page.
 * Priority follows what the UI shows in the price badge:
 *   display_price (post-discount) → min_price → price_adult.
 * Returns null when no numeric price exists (schema is then skipped).
 */
function pickTourPrice(tour: TourDetail): number | null {
  const candidates = [tour.display_price, tour.min_price, tour.price_adult];
  for (const v of candidates) {
    if (typeof v === "number" && v > 0) return v;
  }
  return null;
}

/**
 * Pick the earliest upcoming departure date as `validFrom` for the offer.
 * Falls back to `next_departure_date` from the API summary field.
 */
function pickValidFrom(tour: TourDetail): string | null {
  if (tour.next_departure_date) return tour.next_departure_date;
  const upcoming = tour.periods
    .map((p) => p.start_date)
    .filter(Boolean)
    .sort();
  return upcoming[0] ?? null;
}

/**
 * Availability signal for schema.org/Offer.
 * Uses the aggregate `available_seats` field so it tracks the badge on the page.
 */
function pickAvailability(tour: TourDetail): string {
  return tour.available_seats > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/SoldOut";
}

/**
 * Build a schema.org Product JSON-LD object for a tour detail page.
 * Only includes an `offers` block when a real price is present on the page.
 */
export function tourProductJsonLd(tour: TourDetail): object {
  const url = absoluteUrl(
    tourUrl({
      slug: tour.slug,
      country_slug: tour.country_slug,
      city_slug: tour.city_slug,
    }),
  );

  const price = pickTourPrice(tour);
  const image = tour.cover_image_url || undefined;
  const description =
    tour.meta_description ||
    (tour.description ? tour.description.replace(/<[^>]+>/g, "").slice(0, 300) : undefined);

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.title,
    sku: tour.tour_code,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
  };

  if (image) product.image = image;
  if (description) product.description = description;

  if (price !== null) {
    const validFrom = pickValidFrom(tour);
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      priceCurrency: "THB",
      price: String(price),
      availability: pickAvailability(tour),
      url,
    };
    if (validFrom) offer.validFrom = validFrom;
    product.offers = offer;
  }

  return product;
}
