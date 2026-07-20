// Centralized SEO helper for tour-web (App Router)
// Fetches per-page SEO from the admin DB and builds Next.js Metadata.
// Guarantees og:image is always present and canonical/og:url use the www domain.

import type { Metadata } from "next";
import { API_URL, SITE_URL } from "./config";

const SITE_NAME = "Next Trip Holiday";

// Fallback OG image when a page (and global) has none configured in admin.
export const DEFAULT_OG_IMAGE =
  "https://imagedelivery.net/OGiukopN6pbQwdTofcZnpg/seo-og-global/public";

/**
 * Remove a trailing brand suffix (e.g. " | Next Trip Holiday") from a title so
 * the root layout's title template can append the brand exactly once. Without
 * this, an admin meta_title that already ends with the brand renders as
 * "... | Next Trip Holiday | Next Trip Holiday".
 */
export function stripBrandSuffix(title: string): string {
  let t = (title ?? "").trim();
  const re = /\s*[|\-–—]\s*Next Trip Holiday\s*$/i;
  while (re.test(t)) t = t.replace(re, "").trim();
  return t;
}

export interface SeoData {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  structured_data: string | null;
  custom_head_tags: string | null;
}

/**
 * Fetch SEO settings for a page slug from the admin API.
 * Merges page-specific values over global on the backend.
 * Returns null on any failure so callers can fall back gracefully.
 */
export async function fetchSeo(slug: string): Promise<SeoData | null> {
  try {
    const res = await fetch(`${API_URL}/seo/public/${encodeURIComponent(slug)}`, {
      // Cache at the edge/server for 5 minutes to avoid hitting the API on every request.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as SeoData) ?? null;
  } catch {
    return null;
  }
}

interface SeoFallback {
  title?: string;
  description?: string;
  /** Path portion for canonical/og:url, e.g. "/tours" or "/contact". Defaults to "". */
  path?: string;
  /** Override og:image (e.g. a tour cover image). */
  image?: string;
}

/**
 * Build a Next.js Metadata object from admin SEO settings for the given slug.
 * Always sets metadataBase, canonical, og:image, and twitter card.
 *
 * Usage in a Server Component page:
 *   export async function generateMetadata() { return buildMetadata('home', { path: '' }); }
 */
export async function buildMetadata(
  slug: string,
  fallback: SeoFallback = {}
): Promise<Metadata> {
  const seo = await fetchSeo(slug);

  const path = fallback.path ?? "";
  const canonical = seo?.canonical_url || `${SITE_URL}${path}`;
  const rawTitle = seo?.meta_title || fallback.title || SITE_NAME;
  // Strip any brand already present so the root layout's title template
  // ("%s | Next Trip Holiday") appends it exactly once (avoids duplicate suffix).
  const title = stripBrandSuffix(rawTitle);
  const description = seo?.meta_description || fallback.description || "";
  const ogTitle = seo?.og_title || rawTitle;
  const ogDescription = seo?.og_description || description;
  const ogImage = fallback.image || seo?.og_image || DEFAULT_OG_IMAGE;

  const keywords = seo?.meta_keywords
    ? seo.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: seo?.robots_index ?? true,
      follow: seo?.robots_follow ?? true,
    },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

/**
 * Extract the JSON-LD structured data string for a page (for rendering a
 * <script type="application/ld+json"> in the page body). Returns null if none.
 */
export async function fetchStructuredData(slug: string): Promise<string | null> {
  const seo = await fetchSeo(slug);
  const raw = seo?.structured_data?.trim();
  if (!raw) return null;
  // Validate it is parseable JSON to avoid injecting broken markup.
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    return null;
  }
}
