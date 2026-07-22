import type { Metadata } from "next";
import { API_URL, SITE_URL } from "@/lib/config";
import { DEFAULT_OG_IMAGE, stripBrandSuffix } from "@/lib/seo";

const SITE_NAME = "Next Trip Holiday";

interface TourSeo {
  title?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  cover_image_url?: string | null;
  keywords?: string[] | null;
  duration_days?: number | null;
  duration_nights?: number | null;
}

async function fetchTour(slug: string): Promise<TourSeo | null> {
  try {
    const res = await fetch(`${API_URL}/tours/detail/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as TourSeo) ?? null;
  } catch {
    return null;
  }
}

/**
 * Per-tour dynamic SEO metadata shared by the tour-detail routes.
 *
 * `canonical` is supplied by the caller so the same tour data can back both the
 * new `/tour/{country}/{city}/{slug}` route and the legacy `/tours/{slug}`
 * fallback route with the correct self-referencing canonical URL.
 */
export async function buildTourMetadata(slug: string, canonical: string): Promise<Metadata> {
  const tour = await fetchTour(slug);

  if (!tour) {
    return {
      metadataBase: new URL(SITE_URL),
      alternates: { canonical },
      title: "ทัวร์",
    };
  }

  const title = stripBrandSuffix(tour.meta_title || tour.title || "ทัวร์");
  const durationText =
    tour.duration_days && tour.duration_nights
      ? ` ${tour.duration_days} วัน ${tour.duration_nights} คืน`
      : "";
  const description =
    tour.meta_description ||
    `${tour.title ?? "แพ็คเกจทัวร์"}${durationText} จองง่าย เดินทางสะดวก กับ ${SITE_NAME}`;
  const ogImage = tour.cover_image_url || DEFAULT_OG_IMAGE;
  const keywords =
    Array.isArray(tour.keywords) && tour.keywords.length > 0
      ? tour.keywords
      : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
