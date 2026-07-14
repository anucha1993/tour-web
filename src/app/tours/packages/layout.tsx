import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("tours-packages", { path: "/tours/packages" });
}

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="tours-packages" />
      {children}
    </>
  );
}
