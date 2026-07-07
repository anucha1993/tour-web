import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "ทัวร์ต่างประเทศ" — pulled from admin (slug: tours-international), falls back to global.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("tours-international", { path: "/tours/international" });
}

export default function ToursInternationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="tours-international" />
      {children}
    </>
  );
}
