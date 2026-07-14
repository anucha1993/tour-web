import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("register", { path: "/register" });
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="register" />
      {children}
    </>
  );
}
