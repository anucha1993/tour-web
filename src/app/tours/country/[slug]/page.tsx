import { permanentRedirect } from "next/navigation";
import { countryUrl } from "@/lib/tour-url";

// Legacy country-listing route: /tours/country/{slug}
// 308-redirects to the new flat /tours/{slug} URL. `all` maps to /tours/all,
// which the dual-purpose /tours/[slug] route renders as all international tours.
export default async function LegacyCountryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(countryUrl(slug));
}
