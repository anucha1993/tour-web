// Generic <JsonLd> renderer.
// Serializes one or many schema.org objects into <script type="application/ld+json">.
// Server component — the payload is present in the initial HTML for crawlers.

export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  if (payload.length === 0) return null;

  return (
    <>
      {payload.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Escape `<` to defuse a `</script>` injection inside string values.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
