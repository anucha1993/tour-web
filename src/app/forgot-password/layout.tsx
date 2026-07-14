import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("forgot-password", { path: "/forgot-password" });
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="forgot-password" />
      {children}
    </>
  );
}
