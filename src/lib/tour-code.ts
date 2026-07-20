/**
 * Display-only tour code formatter.
 *
 * Strips the "NT" + 4-digit year prefix so only the trailing sequence shows.
 * e.g. "NT2026031023" -> "031023". Codes that don't match the pattern are
 * returned unchanged.
 *
 * Use ONLY for on-screen display. Keep the full code for search filters,
 * booking references, copy/share text, and SEO/structured data.
 */
export function displayTourCode(code?: string | null): string {
  if (!code) return '';
  const match = /^NT\d{4}(\d{4,})$/i.exec(code.trim());
  return match ? match[1] : code;
}
