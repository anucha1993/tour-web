import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import { tourUrl } from "@/lib/tour-url";
import { fetchTourLocation, fetchCountryInfo } from "@/lib/tours-slug";
import TourDetailView from "@/components/tours/TourDetailView";
import CountryToursView from "@/components/tours/CountryToursView";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";

function ListingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
    </div>
  );
}

// Dual-purpose `/tours/{slug}` route.
//
//  - When `{slug}` is a real tour, 308-redirect to the canonical
//    `/tour/{country}/{city}/{slug}` (or `/tour/{country}/{slug}`) URL. Tours
//    with no country keep rendering here as a graceful fallback.
//  - Otherwise `{slug}` is treated as a country and the country listing renders.
export default async function ToursSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = await fetchTourLocation(slug);

  if (loc) {
    const target = tourUrl({
      slug,
      country_slug: loc.country_slug,
      city_slug: loc.city_slug,
    });
    if (target !== `/tours/${slug}`) {
      permanentRedirect(target);
    }
    return <TourDetailView />;
  }

  // Country listing: emit BreadcrumbList JSON-LD so search results show a
  // clear path (Home > ทัวร์ต่างประเทศ > ทัวร์{country}).
  const country = await fetchCountryInfo(slug);
  const countryName = country?.name_th || slug.replace(/-/g, " ");
  const schemas = [
    breadcrumbJsonLd([
      { name: "ทัวร์ต่างประเทศ", url: "/tours/international" },
      { name: `ทัวร์${countryName}`, url: `/tours/${slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense fallback={<ListingFallback />}>
        <CountryToursView countrySlug={slug} />
      </Suspense>
    </>
  );
}
