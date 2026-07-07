import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "โปรโมชั่น" — pulled from admin (slug: promotions), falls back to global.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("promotions", { path: "/promotions" });
}

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="promotions" />
      {children}
    </>
  );
}
