import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("payment-terms", { path: "/payment-terms" });
}

export default function PaymentTermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="payment-terms" />
      {children}
    </>
  );
}
