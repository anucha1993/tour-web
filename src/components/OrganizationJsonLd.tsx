// Server component: site-wide Organization (TravelAgency) + WebSite JSON-LD.
// Rendered once in the root layout to support brand knowledge panel and the
// sitelinks search box in Google.
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  jsonLdString,
} from "@/lib/structured-data";

export default function OrganizationJsonLd() {
  const graph = [buildOrganizationJsonLd(), buildWebsiteJsonLd()];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(graph) }}
    />
  );
}
