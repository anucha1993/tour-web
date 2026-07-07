import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "บล็อก" listing — pulled from admin (slug: blog), falls back to global.
// Individual posts under /blog/[slug] can override with their own generateMetadata.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("blog", { path: "/blog" });
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="blog" />
      {children}
    </>
  );
}
