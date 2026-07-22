/**
 * JSON-LD structured data builders (schema.org).
 *
 * These generate rich-result markup from REAL tour/site data (price, rating,
 * breadcrumbs, organization). This is separate from <SeoJsonLd>, which renders
 * manual JSON-LD authored in the admin. Use both together.
 */

import { config, SITE_URL } from "./config";
import { tourUrl } from "./tour-url";

const SITE_NAME = "Next Trip Holiday";
const base = SITE_URL.replace(/\/$/, "");

/** Serialize a schema object/array to a safe <script> string. */
export function jsonLdString(data: unknown): string {
  // Escape "<" to prevent breaking out of the <script> context.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export interface TourForSchema {
  id: number;
  slug: string;
  country_slug?: string | null;
  city_slug?: string | null;
  tour_code?: string | null;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  display_price?: number | null;
  min_price?: number | null;
  price_adult?: number | null;
  duration_days?: number | null;
  duration_nights?: number | null;
  next_departure_date?: string | null;
  primary_country?: { name?: string | null; iso2?: string | null } | null;
}

export interface RatingForSchema {
  average_rating?: number | null;
  total_reviews?: number | null;
}

/** Strip HTML tags and clamp length for schema description fields. */
function plainText(html: string | null | undefined, max = 300): string | undefined {
  if (!html) return undefined;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Product schema for a tour — enables price (and star) rich snippets.
 * AggregateRating is included ONLY when real reviews exist (Google policy:
 * ratings must be visible on the page, which they are in the reviews section).
 */
export function buildTourProductJsonLd(
  tour: TourForSchema,
  rating?: RatingForSchema | null
): Record<string, unknown> {
  const url = `${base}${tourUrl(tour)}`;
  const price = tour.display_price ?? tour.min_price ?? tour.price_adult ?? null;

  const durationText =
    tour.duration_days && tour.duration_nights
      ? ` ${tour.duration_days} วัน ${tour.duration_nights} คืน`
      : "";
  const description =
    plainText(tour.description) ||
    `${tour.title}${durationText} จองง่าย เดินทางสะดวก กับ ${SITE_NAME}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.title,
    description,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
  };

  if (tour.tour_code) schema.sku = tour.tour_code;
  if (tour.cover_image_url) schema.image = [tour.cover_image_url];

  if (price && price > 0) {
    // priceValidUntil: prefer next departure date, else ~90 days out.
    let validUntil = tour.next_departure_date || null;
    if (!validUntil) {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      validUntil = d.toISOString().slice(0, 10);
    }
    schema.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "THB",
      price: String(Math.round(price)),
      priceValidUntil: validUntil,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    };
  }

  if (rating && rating.total_reviews && rating.total_reviews > 0 && rating.average_rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(rating.average_rating.toFixed(1)),
      reviewCount: rating.total_reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/** BreadcrumbList: Home > (International|Domestic) > Tour title. */
export function buildTourBreadcrumbJsonLd(tour: TourForSchema): Record<string, unknown> {
  const isDomestic = (tour.primary_country?.iso2 || "").toUpperCase() === "TH";
  const items: { name: string; item?: string }[] = [
    { name: "หน้าแรก", item: `${base}/` },
    isDomestic
      ? { name: "ทัวร์ในประเทศ", item: `${base}/tours/domestic` }
      : { name: "ทัวร์ต่างประเทศ", item: `${base}/tours/international` },
    { name: tour.title, item: `${base}${tourUrl(tour)}` },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.item ? { item: it.item } : {}),
    })),
  };
}

/** Organization (TravelAgency) — for brand knowledge panel. */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  const sameAs = [
    config.social.facebook,
    config.social.instagram,
    config.social.youtube,
    config.social.tiktok,
    config.social.line,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE_NAME,
    url: base,
    logo: `${base}/logo.svg`,
    image: `${base}/logo.svg`,
    telephone: config.phone,
    email: config.email,
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressCountry: "TH",
    },
  };
}

/** WebSite with SearchAction — enables sitelinks search box. */
export function buildWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base,
    inLanguage: "th-TH",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
