import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "เกี่ยวกับเรา" — pulled from admin (slug: about), falls back to global.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("about", { path: "/about" });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="about" />
      {children}
    </>
  );
}
