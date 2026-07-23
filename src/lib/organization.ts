import { API_URL } from "@/lib/config";

/**
 * Server-side absolute API base.
 *
 * In production `NEXT_PUBLIC_API_URL` is the relative value `/api`, which the
 * server runtime's `fetch` cannot resolve. `API_PROXY_TARGET` is absolute in
 * every environment, so prefer it server-side and fall back to `API_URL`.
 */
function serverApiBase(): string {
  const base = process.env.API_PROXY_TARGET || API_URL;
  return base.replace(/\/$/, "");
}

export interface OrgFaq {
  question: string;
  answer: string;
}

export interface OrgAddress {
  street?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
}

export interface OrgAggregateRating {
  value: number;
  count: number;
}

export interface OrganizationPublic {
  legal_name?: string | null;
  description?: string | null;
  price_range?: string | null;
  area_served?: string[] | null;
  languages?: string[] | null;
  founding_date?: string | null;
  same_as?: string[] | null;
  address?: OrgAddress | null;
  aggregate_rating?: OrgAggregateRating | null;
}

export interface OrganizationData {
  organization: OrganizationPublic;
  faqs: OrgFaq[];
}

/**
 * Fetch admin-managed organization schema data + FAQ from the API.
 * Returns null on any failure so the caller can fall back to config defaults.
 */
export async function fetchOrganizationData(): Promise<OrganizationData | null> {
  try {
    const res = await fetch(`${serverApiBase()}/organization/public`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data as OrganizationData | undefined;
    if (!data || !data.organization) return null;
    return {
      organization: data.organization,
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
    };
  } catch {
    return null;
  }
}
