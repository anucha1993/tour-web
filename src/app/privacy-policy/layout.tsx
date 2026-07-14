import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("privacy-policy", { path: "/privacy-policy" });
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="privacy-policy" />
      {children}
    </>
  );
}
