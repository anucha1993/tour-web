import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "ติดต่อเรา" — pulled from admin (slug: contact), falls back to global.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("contact", { path: "/contact" });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="contact" />
      {children}
    </>
  );
}
