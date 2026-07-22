import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/lib/config";
import { tourUrl } from "@/lib/tour-url";

/**
 * Dynamic sitemap.xml generated from the API.
 *
 * Includes static marketing pages + every active tour, published blog post,
 * and active country landing page. Regenerated periodically (revalidate).
 */

export const revalidate = 3600; // 1 hour

interface SlugRow {
  slug: string;
  country_slug?: string | null;
  city_slug?: string | null;
  updated_at?: string | null;
}

interface SitemapData {
  tours: SlugRow[];
  blogs: SlugRow[];
  countries: SlugRow[];
}

async function fetchSitemapData(): Promise<SitemapData> {
  try {
    const res = await fetch(`${API_URL}/sitemap`, {
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`sitemap fetch ${res.status}`);
    const json = await res.json();
    const data = json?.data ?? {};
    return {
      tours: Array.isArray(data.tours) ? data.tours : [],
      blogs: Array.isArray(data.blogs) ? data.blogs : [],
      countries: Array.isArray(data.countries) ? data.countries : [],
    };
  } catch {
    // Never fail the sitemap — fall back to static pages only.
    return { tours: [], blogs: [], countries: [] };
  }
}

function toDate(value?: string | null): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  // Static, high-value marketing pages.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/tours/international`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tours/domestic`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tours/festival`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tours/packages`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/promotions`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const { tours, blogs, countries } = await fetchSitemapData();

  const tourRoutes: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${base}${tourUrl(t)}`,
    lastModified: toDate(t.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const countryRoutes: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${base}/tours/${c.slug}`,
    lastModified: toDate(c.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: toDate(b.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...tourRoutes, ...countryRoutes, ...blogRoutes];
}
