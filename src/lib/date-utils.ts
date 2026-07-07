// Safe date formatting helpers for tour-web.
// Guards against null/undefined/unparseable values so the UI never shows "Invalid Date".

/**
 * Format a date value as a Thai long date (e.g. "7 กรกฎาคม 2569").
 * Returns `fallback` when the value is missing or cannot be parsed.
 */
export function formatThaiDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
  fallback = "—"
): string {
  if (value === null || value === undefined || value === "") return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("th-TH", options);
}

/**
 * Format a date value as a short Thai date (e.g. "7 ก.ค. 69").
 */
export function formatThaiDateShort(
  value: string | number | Date | null | undefined,
  fallback = "—"
): string {
  return formatThaiDate(
    value,
    { year: "2-digit", month: "short", day: "numeric" },
    fallback
  );
}
