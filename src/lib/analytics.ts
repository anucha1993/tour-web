/**
 * Analytics event helpers (GA4 + Meta Pixel).
 *
 * All helpers are safe to call unconditionally — if the underlying tracker
 * hasn't loaded (e.g. the user declined marketing/analytics cookies) the call
 * is simply a no-op. Scripts are injected by <Analytics /> only after consent.
 */

type GtagArgs = [string, ...unknown[]];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void; page: () => void };
  }
}

function hasGtag(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function hasFbq(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

function hasTtq(): boolean {
  return typeof window !== 'undefined' && typeof window.ttq?.track === 'function';
}

/** Fire a GA4 event (no-op if GA4 not loaded). */
export function gaEvent(name: string, params: Record<string, unknown> = {}): void {
  if (hasGtag()) window.gtag!('event', name, params);
}

/** Fire a Meta Pixel standard event (no-op if Pixel not loaded). */
export function fbEvent(name: string, params: Record<string, unknown> = {}): void {
  if (hasFbq()) window.fbq!('track', name, params);
}

/** Fire a TikTok Pixel event (no-op if not loaded). */
export function ttEvent(name: string, params: Record<string, unknown> = {}): void {
  if (hasTtq()) window.ttq!.track(name, params);
}

/* ---------- Business events for a tour website ---------- */

/** Page view — fire on route change. GA4 usually auto-sends, Pixel needs manual. */
export function trackPageView(url?: string): void {
  if (hasGtag() && url) window.gtag!('event', 'page_view', { page_path: url });
  if (hasFbq()) window.fbq!('track', 'PageView');
  if (hasTtq()) window.ttq!.page();
}

/** Viewing a specific tour program page. */
export function trackViewContent(params: {
  id: number | string;
  name: string;
  price?: number | null;
  currency?: string;
}): void {
  const currency = params.currency ?? 'THB';
  gaEvent('view_item', {
    currency,
    value: params.price ?? undefined,
    items: [{ item_id: params.id, item_name: params.name, price: params.price ?? undefined }],
  });
  fbEvent('ViewContent', {
    content_ids: [String(params.id)],
    content_name: params.name,
    content_type: 'product',
    value: params.price ?? undefined,
    currency,
  });
  ttEvent('ViewContent', {
    content_id: String(params.id),
    content_name: params.name,
    value: params.price ?? undefined,
    currency,
  });
}

/** Searching for tours. */
export function trackSearch(searchTerm: string): void {
  gaEvent('search', { search_term: searchTerm });
  fbEvent('Search', { search_string: searchTerm });
  ttEvent('Search', { query: searchTerm });
}

/** User initiates contact (phone/LINE/contact form) — a "Lead". */
export function trackLead(params: { method?: string; value?: number } = {}): void {
  gaEvent('generate_lead', { method: params.method, value: params.value });
  fbEvent('Lead', { content_name: params.method });
  ttEvent('Contact', { description: params.method });
}

/** User starts a booking / checkout. */
export function trackInitiateCheckout(params: {
  id?: number | string;
  name?: string;
  value?: number | null;
  currency?: string;
} = {}): void {
  const currency = params.currency ?? 'THB';
  gaEvent('begin_checkout', {
    currency,
    value: params.value ?? undefined,
    items: params.id ? [{ item_id: params.id, item_name: params.name }] : undefined,
  });
  fbEvent('InitiateCheckout', {
    content_ids: params.id ? [String(params.id)] : undefined,
    content_name: params.name,
    value: params.value ?? undefined,
    currency,
  });
  ttEvent('InitiateCheckout', {
    content_id: params.id ? String(params.id) : undefined,
    value: params.value ?? undefined,
    currency,
  });
}
