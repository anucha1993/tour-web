// Server component: site-wide Organization (TravelAgency) + WebSite + FAQPage
// JSON-LD. Rendered once in the root layout to support the brand knowledge
// panel, the sitelinks search box, and FAQ rich results / AI answer grounding.
// Descriptive fields, address, socials, rating and FAQs are admin-managed via
// the tour-backend "องค์กร & Schema" page and fall back to config defaults.
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  buildFaqJsonLd,
  jsonLdString,
} from "@/lib/structured-data";
import { fetchOrganizationData } from "@/lib/organization";

export default async function OrganizationJsonLd() {
  const data = await fetchOrganizationData();

  const graph: Record<string, unknown>[] = [
    buildOrganizationJsonLd(data?.organization),
    buildWebsiteJsonLd(),
  ];

  const faqSchema = buildFaqJsonLd(data?.faqs);
  if (faqSchema) graph.push(faqSchema);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(graph) }}
    />
  );
}

