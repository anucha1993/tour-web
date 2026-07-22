import { Suspense } from "react";
import CityToursView from "@/components/tours/CityToursView";

function ListingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
    </div>
  );
}

// City listing: /tours/{country}/{city}
export default async function CityToursPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  return (
    <Suspense fallback={<ListingFallback />}>
      <CityToursView countrySlug={slug} citySlug={city} />
    </Suspense>
  );
}
