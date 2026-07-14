import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("terms", { path: "/terms" });
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="terms" />
      {children}
    </>
  );
}
