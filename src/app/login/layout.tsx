import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("login", { path: "/login" });
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="login" />
      {children}
    </>
  );
}
