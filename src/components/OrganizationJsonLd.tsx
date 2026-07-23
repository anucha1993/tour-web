// Server component: site-wide Organization (TravelAgency) + WebSite JSON-LD.
// Rendered once in the root layout to support the brand knowledge panel and the
// sitelinks search box. Descriptive fields, address, socials and rating are
// admin-managed via the tour-backend "องค์กร & Schema" page and fall back to
// config defaults. The FAQPage schema is rendered on /faq (where the FAQ
// content is visible), not here.
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  jsonLdString,
} from "@/lib/structured-data";
import { fetchOrganizationData } from "@/lib/organization";

export default async function OrganizationJsonLd() {
  const data = await fetchOrganizationData();

  const graph: Record<string, unknown>[] = [
    buildOrganizationJsonLd(data?.organization),
    buildWebsiteJsonLd(),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(graph) }}
    />
  );
}

