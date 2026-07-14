import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("data-deletion", { path: "/data-deletion" });
}

export default function DataDeletionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="data-deletion" />
      {children}
    </>
  );
}
