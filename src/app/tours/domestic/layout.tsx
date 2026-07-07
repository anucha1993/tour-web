import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "ทัวร์ในประเทศ" — pulled from admin (slug: tours-domestic), falls back to global.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("tours-domestic", { path: "/tours/domestic" });
}

export default function ToursDomesticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="tours-domestic" />
      {children}
    </>
  );
}
