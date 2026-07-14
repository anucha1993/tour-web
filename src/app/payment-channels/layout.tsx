import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SeoJsonLd from "@/components/SeoJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("payment-channels", { path: "/payment-channels" });
}

export default function PaymentChannelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd slug="payment-channels" />
      {children}
    </>
  );
}
