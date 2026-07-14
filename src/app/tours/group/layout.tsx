import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("tours-group", { path: "/tours/group" });
}

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="tours-group" />
      {children}
    </>
  );
}
