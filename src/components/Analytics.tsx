'use client';

/**
 * Analytics loader — injects GA4 and Meta Pixel (and optionally TikTok) ONLY
 * after the user grants the matching cookie-consent category (PDPA compliant).
 *
 *  - GA4 / GTM  → requires `analytics` consent
 *  - Meta Pixel / TikTok → requires `marketing` consent
 *
 * IDs come from env (see lib/config.ts). If an ID is empty the tracker is
 * skipped entirely, so this is safe to ship before the client provides IDs.
 */

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { config } from '@/lib/config';
import { useConsent } from '@/contexts/ConsentContext';
import { trackPageView } from '@/lib/analytics';

const { ga4Id, gtmId, fbPixelId, tiktokPixelId } = config.analytics;

/** Fires a PageView on client-side route changes (SPA navigation). */
function PageViewTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    // The base snippet already sends the first PageView; skip the initial run
    // to avoid double-counting, then track every subsequent navigation.
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams, enabled]);

  return null;
}

export default function Analytics() {
  const { analyticsAllowed, marketingAllowed } = useConsent();

  const loadGa4 = analyticsAllowed && !!ga4Id;
  const loadGtm = analyticsAllowed && !!gtmId;
  const loadPixel = marketingAllowed && !!fbPixelId;
  const loadTiktok = marketingAllowed && !!tiktokPixelId;

  return (
    <>
      {/* ---------- Google Analytics 4 ---------- */}
      {loadGa4 && (
        <>
          <Script
            id="ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* ---------- Google Tag Manager (optional) ---------- */}
      {loadGtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {/* ---------- Meta (Facebook) Pixel ---------- */}
      {loadPixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* ---------- TikTok Pixel (optional) ---------- */}
      {loadTiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
              var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* SPA page-view tracking (only meaningful when a tracker is active) */}
      <Suspense fallback={null}>
        <PageViewTracker enabled={loadGa4 || loadPixel || loadTiktok} />
      </Suspense>
    </>
  );
}
