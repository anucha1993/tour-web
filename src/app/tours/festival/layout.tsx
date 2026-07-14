import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("tours-festival", { path: "/tours/festival" });
}

export default function FestivalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="tours-festival" />
      {children}
    </>
  );
}
