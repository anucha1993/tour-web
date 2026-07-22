import { permanentRedirect } from "next/navigation";
import { cityUrl } from "@/lib/tour-url";
import { fetchCityInfo } from "@/lib/tours-slug";

// Legacy city-listing route: /tours/city/{slug}
// 308-redirects to the new nested /tours/{country}/{city} URL. The country slug
// is resolved from the API; if it can't be determined we fall back to the
// international listing rather than 404.
export default async function LegacyCityRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = await fetchCityInfo(slug);
  if (info?.country_slug) {
    permanentRedirect(cityUrl(info.country_slug, slug));
  }
  permanentRedirect("/tours/international");
}
