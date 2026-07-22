import { notFound } from "next/navigation";
import TourDetailView from "@/components/tours/TourDetailView";

// New canonical tour-detail route. A single catch-all handles both shapes:
//   /tour/{country}/{slug}          -> rest = [slug]        (tours with no city)
//   /tour/{country}/{city}/{slug}   -> rest = [city, slug]  (tours with a city)
// The tour slug is always the LAST catch-all segment.
export default async function TourDetailByLocationPage({
  params,
}: {
  params: Promise<{ country: string; rest: string[] }>;
}) {
  const { rest } = await params;
  if (!rest || rest.length < 1 || rest.length > 2) notFound();
  const slug = rest[rest.length - 1];
  return <TourDetailView slug={slug} />;
}
