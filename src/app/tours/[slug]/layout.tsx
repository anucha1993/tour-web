import type { Metadata } from "next";
import { API_URL, SITE_URL } from "@/lib/config";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import TourJsonLd from "@/components/TourJsonLd";

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

// Per-tour dynamic SEO: uses the tour's own title, meta and COVER IMAGE as the OG image
// so shared links on Facebook/LINE show the correct tour photo.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `${SITE_URL}/tours/${slug}`;
  const tour = await fetchTour(slug);

  if (!tour) {
    return {
      metadataBase: new URL(SITE_URL),
      alternates: { canonical },
      title: "ทัวร์",
    };
  }

  const title = tour.meta_title || tour.title || "ทัวร์";
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

export default async function TourDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      <TourJsonLd slug={slug} />
      {children}
    </>
  );
}
