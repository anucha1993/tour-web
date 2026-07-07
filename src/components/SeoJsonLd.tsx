// Server component that renders per-page JSON-LD structured data from admin SEO settings.
// Google reads application/ld+json anywhere in the document, so rendering in the body is fine.
import { fetchStructuredData } from "@/lib/seo";

export default async function SeoJsonLd({ slug }: { slug: string }) {
  const jsonLd = await fetchStructuredData(slug);
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      // structured_data is validated as JSON in fetchStructuredData before rendering.
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
