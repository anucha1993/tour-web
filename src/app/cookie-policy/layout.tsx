import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("cookie-policy", { path: "/cookie-policy" });
}

export default function CookieLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="cookie-policy" />
      {children}
    </>
  );
}
