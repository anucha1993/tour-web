import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import SeoJsonLd from "@/components/SeoJsonLd";

// SEO for "ทัวร์ต่างประเทศ" — pulled from admin (slug: tours-international), falls back to global.
export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("tours-international", { path: "/tours/international" });
  // Force the self-canonical for the international listing. The admin record has
  // historically pointed this at /tours/country/all, which de-indexed every
  // ?country_id= filter variant. The listing must canonicalize to itself.
  return { ...meta, alternates: { canonical: `${SITE_URL}/tours/international` } };
}

export default function ToursInternationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd slug="tours-international" />
      {children}
    </>
  );
}
