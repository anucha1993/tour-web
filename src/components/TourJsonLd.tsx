// Server component: auto-generated Product + BreadcrumbList JSON-LD for a tour,
// built from live tour data (price, rating). Complements the admin-authored
// <SeoJsonLd>. Renders nothing if the tour can't be fetched.
import { API_URL } from "@/lib/config";
import {
  buildTourProductJsonLd,
  buildTourBreadcrumbJsonLd,
  jsonLdString,
  type TourForSchema,
  type RatingForSchema,
} from "@/lib/structured-data";

async function fetchTour(slug: string): Promise<TourForSchema | null> {
  try {
    const res = await fetch(`${API_URL}/tours/detail/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as TourForSchema) ?? null;
  } catch {
    return null;
  }
}

async function fetchRating(slug: string): Promise<RatingForSchema | null> {
  try {
    const res = await fetch(`${API_URL}/tours/${encodeURIComponent(slug)}/reviews/summary`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data?.summary as RatingForSchema) ?? null;
  } catch {
    return null;
  }
}

export default async function TourJsonLd({ slug }: { slug: string }) {
  const tour = await fetchTour(slug);
  if (!tour) return null;

  const rating = await fetchRating(slug);

  const graph = [
    buildTourProductJsonLd(tour, rating),
    buildTourBreadcrumbJsonLd(tour),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(graph) }}
    />
  );
}
