import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("reviews", { path: "/reviews" });
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="reviews" />
      {children}
    </>
  );
}
