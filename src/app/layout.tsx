import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { TourBadgesProvider } from "@/contexts/TourBadgesContext";
import { ConsentProvider } from "@/contexts/ConsentContext";
import LazyFavoritesDrawer from "@/components/home/LazyFavoritesDrawer";
import LazyFooter from "@/components/layout/LazyFooter";
import LazyContactPopup from "@/components/layout/LazyContactPopup";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import { buildMetadata } from "@/lib/seo";
import { getTrackingConfig } from "@/lib/tracking";

/**
 * Extract JS from inline <script>...</script> tags in a raw HTML snippet.
 * Concatenates ALL inline scripts into one blob so they run in <head> at SSR.
 * HTML comments (<!-- ... -->) and other markup are stripped.
 */
function extractInlineScripts(html: string): string {
  const out: string[] = [];
  // Match <script> ... </script> where script has no `src` attribute
  const re = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const body = m[1].trim();
    if (body) out.push(body);
  }
  return out.join('\n');
}

const notoSansThai = localFont({
  src: "./fonts/NotoSansThai-VariableFont.woff2",
  variable: "--font-noto-sans-thai",
  // "optional" + preload eliminates font-swap layout shift (CLS): the browser
  // uses the font if it arrives within the short block period, otherwise keeps
  // the fallback for this load without ever swapping. The font is small (61KB)
  // and preloaded, so it almost always wins the race on real connections.
  display: "optional",
});

// Site-wide default metadata is pulled from the admin "global" SEO settings in the DB.
// Individual pages override this via their own generateMetadata().
// Guarantees a correct www canonical/og:url and an og:image on every page.
export async function generateMetadata(): Promise<Metadata> {
  const base = await buildMetadata("global", { path: "" });
  return {
    ...base,
    title: {
      default:
        (typeof base.title === "string" && base.title) ||
        "Next Trip Holiday - ทัวร์ท่องเที่ยวทั่วโลก",
      template: "%s | Next Trip Holiday",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tracking = await getTrackingConfig();
  // Detect whether the admin already pasted a GTM/GA snippet into the custom
  // head/body HTML. If so, skip the structured GTM injection (noscript below +
  // the consent-gated gtm.js in <Analytics>) so GTM is not loaded twice, which
  // would double-count pageviews.
  const customTrackingHtml = `${tracking.custom_head_html || ''}\n${tracking.custom_body_html || ''}`;
  const customHasGtm = /googletagmanager\.com\/(ns|gtm)\.|GTM-[A-Z0-9]{4,}/i.test(customTrackingHtml);
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://api.nexttripholiday.com" />
        <link rel="preconnect" href="https://imagedelivery.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.nexttripholiday.com" />
        <link rel="dns-prefetch" href="https://imagedelivery.net" />
        {/* Admin-supplied raw HTML snippet for <head> (GTM main script, GA4 gtag, etc.).
            Server-rendered — runs before hydration, no consent gating. */}
        {tracking.enabled && tracking.custom_head_html && (
          <script
            dangerouslySetInnerHTML={{ __html: extractInlineScripts(tracking.custom_head_html) }}
          />
        )}
      </head>
      <body className={`${notoSansThai.variable} antialiased`}>
        {/* Admin-supplied raw HTML for post-<body> position (GTM <noscript> iframe, etc.). */}
        {tracking.enabled && tracking.custom_body_html && (
          <div
            aria-hidden="true"
            style={{ display: 'contents' }}
            dangerouslySetInnerHTML={{ __html: tracking.custom_body_html }}
          />
        )}
        {/* GTM noscript fallback (renders only when GTM ID is configured AND the
            admin has not already injected GTM via custom HTML — avoids a duplicate).
            Server-rendered outside ConsentProvider — users without JS cannot
            interact with the consent banner anyway. */}
        {tracking.enabled && tracking.gtm_id && !customHasGtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${tracking.gtm_id}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <OrganizationJsonLd />
        <ConsentProvider>
          <AuthProvider>
            <FavoritesProvider>
              <TourBadgesProvider>
                <Header />
                <main className="min-h-screen pt-[80px] lg:pt-[160px] isolate">
                  {children}
                </main>
                <LazyFooter />
                <LazyFavoritesDrawer />
                <LazyContactPopup />
              </TourBadgesProvider>
            </FavoritesProvider>
          </AuthProvider>
          <CookieConsent />
          <Analytics tracking={tracking} gtmInCustomHtml={customHasGtm} />
        </ConsentProvider>
      </body>
    </html>
  );
}
