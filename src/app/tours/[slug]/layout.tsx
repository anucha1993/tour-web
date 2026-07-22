import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { buildTourMetadata } from "@/lib/tour-metadata";
import { fetchTourLocation, fetchCountryInfo } from "@/lib/tours-slug";
import TourJsonLd from "@/components/TourJsonLd";

// `/tours/{slug}` is dual-purpose (see page.tsx): either a real tour or a
// country listing. Emit per-tour SEO for tours, and a self-canonical country
// title otherwise. City pages (`/tours/{slug}/{city}`) override this metadata in
// their own layout.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = await fetchTourLocation(slug);
  if (loc) {
    return buildTourMetadata(slug, `${SITE_URL}/tours/${slug}`);
  }
  // Country listing. `all` is the "all international tours" view whose canonical
  // authority is /tours/international.
  const canonical =
    slug === "all" ? `${SITE_URL}/tours/international` : `${SITE_URL}/tours/${slug}`;
  const country = await fetchCountryInfo(slug);
  const title = country ? `ทัวร์${country.name_th}` : "ทัวร์ต่างประเทศ";
  return { title, alternates: { canonical } };
}

export default async function ToursSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = await fetchTourLocation(slug);
  return (
    <>
      {loc ? <TourJsonLd slug={slug} /> : null}
      {children}
    </>
  );
}
