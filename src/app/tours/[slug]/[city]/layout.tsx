import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { fetchCityInfo } from "@/lib/tours-slug";

// City-listing SEO: /tours/{country}/{city}. Overrides the parent country
// metadata declared in /tours/[slug]/layout.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city } = await params;
  const info = await fetchCityInfo(city);
  const title = info ? `ทัวร์${info.name_th}` : "ทัวร์ต่างประเทศ";
  return {
    title,
    alternates: { canonical: `${SITE_URL}/tours/${slug}/${city}` },
  };
}

export default function CityToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
