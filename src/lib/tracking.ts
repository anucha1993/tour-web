/**
 * Server-side tracking config loader.
 *
 * Fetches the current Google Tag / Facebook Pixel IDs from tour-api so we
 * can inject the matching scripts without requiring a rebuild. Cached for
 * 5 minutes to keep the API load negligible.
 *
 * NOTE: env vars (NEXT_PUBLIC_GA4_ID etc.) still work as a fallback for
 * developers running locally without hitting the API. Runtime API values
 * take precedence when present.
 */

import { API_URL, config } from '@/lib/config';

export interface TrackingConfig {
  gtm_id: string;
  ga4_id: string;
  fb_pixel_id: string;
  tiktok_pixel_id: string;
  enabled: boolean;
  custom_head_html: string;
  custom_body_html: string;
}

const EMPTY: TrackingConfig = {
  gtm_id: '',
  ga4_id: '',
  fb_pixel_id: '',
  tiktok_pixel_id: '',
  enabled: true,
  custom_head_html: '',
  custom_body_html: '',
};

/** Fetches the public tracking config; falls back to env if the API is down. */
export async function getTrackingConfig(): Promise<TrackingConfig> {
  try {
    const res = await fetch(`${API_URL}/tracking/public`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { success?: boolean; data?: Partial<TrackingConfig> };
    if (!json?.success || !json.data) throw new Error('malformed');

    return {
      gtm_id: json.data.gtm_id ?? '',
      ga4_id: json.data.ga4_id ?? '',
      fb_pixel_id: json.data.fb_pixel_id ?? '',
      tiktok_pixel_id: json.data.tiktok_pixel_id ?? '',
      enabled: json.data.enabled ?? true,
      custom_head_html: json.data.custom_head_html ?? '',
      custom_body_html: json.data.custom_body_html ?? '',
    };
  } catch {
    // Fallback: env vars from config.ts. Master switch defaults to on so that
    // existing deployments using env-based IDs keep working.
    return {
      ...EMPTY,
      gtm_id: config.analytics.gtmId,
      ga4_id: config.analytics.ga4Id,
      fb_pixel_id: config.analytics.fbPixelId,
      tiktok_pixel_id: config.analytics.tiktokPixelId,
      enabled: true,
    };
  }
}
