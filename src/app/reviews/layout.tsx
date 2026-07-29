import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, absoluteUrl } from "@/lib/jsonld";
import { API_URL } from "@/lib/config";
import type { TourReview, ReviewSummary } from "@/lib/api";

const SITE_NAME = "Next Trip Holiday";

/**
 * Server-side API base — API_URL may be relative ("/api") in production, which
 * the server runtime cannot resolve. API_PROXY_TARGET is absolute in every env.
 */
function serverApiBase(): string {
  const base = process.env.API_PROXY_TARGET || API_URL;
  return base.replace(/\/$/, "");
}

/**
 * Fetch the first page of approved reviews on the server so we can emit
 * Review + AggregateRating schema.org in the initial SSR HTML.
 *
 * Only reviews with a real comment are included — the schema must reflect
 * on-page content, and empty-body Review nodes fail Google validation.
 */
async function getReviewsForSchema(): Promise<{
  summary: ReviewSummary | null;
  reviews: TourReview[];
}> {
  try {
    const res = await fetch(
      `${serverApiBase()}/reviews/all?per_page=24&sort=latest`,
      { next: { revalidate: 600 } },
    );
    if (!res.ok) return { summary: null, reviews: [] };
    const json = await res.json();
    const summary: ReviewSummary | null = json?.data?.summary ?? null;
    const raw: TourReview[] = json?.data?.reviews?.data ?? [];
    const reviews = raw.filter((r) => (r.comment || "").trim().length > 0);
    return { summary, reviews };
  } catch {
    return { summary: null, reviews: [] };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("reviews", { path: "/reviews" });
}

export default async function ReviewsLayout({ children }: { children: React.ReactNode }) {
  const { summary, reviews } = await getReviewsForSchema();

  const schemas: object[] = [
    breadcrumbJsonLd([{ name: "รีวิวลูกค้า", url: "/reviews" }]),
  ];

  // Emit AggregateRating + Review only when we actually have data — never
  // fabricate a rating (Google penalizes structured data that mismatches the
  // page, and hard-coded aggregate values also drift from reality over time).
  if (summary && summary.total_reviews > 0 && reviews.length > 0) {
    const reviewNodes = reviews.slice(0, 20).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.reviewer_name || "ลูกค้า" },
      datePublished: r.created_at,
      reviewRating: {
        "@type": "Rating",
        ratingValue: Number(r.rating) || 5,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: (r.comment || "").slice(0, 500),
    }));

    schemas.push({
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(summary.average_rating.toFixed(1)),
        reviewCount: summary.total_reviews,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviewNodes,
    });
  }

  return (
    <>
      <SeoJsonLd slug="reviews" />
      <JsonLd data={schemas} />
      {children}
    </>
  );
}
