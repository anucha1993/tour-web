import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/config";
import { buildTourMetadata } from "@/lib/tour-metadata";
import TourJsonLd from "@/components/TourJsonLd";

type TourRouteParams = { country: string; rest: string[] };

// Per-tour dynamic SEO. Canonical points at the new URL, which is either
// /tour/{country}/{city}/{slug} or /tour/{country}/{slug} depending on whether
// the tour has a linked city. The tour slug is the last catch-all segment.
export async function generateMetadata({
  params,
}: {
  params: Promise<TourRouteParams>;
}): Promise<Metadata> {
  const { country, rest } = await params;
  const slug = rest[rest.length - 1];
  const canonical = `${SITE_URL}/tour/${country}/${rest.join("/")}`;
  return buildTourMetadata(slug, canonical);
}

export default async function TourDetailByLocationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<TourRouteParams>;
}) {
  const { rest } = await params;
  if (!rest || rest.length < 1 || rest.length > 2) notFound();
  const slug = rest[rest.length - 1];
  return (
    <>
      <TourJsonLd slug={slug} />
      {children}
    </>
  );
}
