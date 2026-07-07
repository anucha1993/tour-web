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

const notoSansThai = localFont({
  src: "./fonts/NotoSansThai-VariableFont_wdth,wght.ttf",
  variable: "--font-noto-sans-thai",
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://api.nexttripholiday.com" />
        <link rel="preconnect" href="https://imagedelivery.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.nexttripholiday.com" />
        <link rel="dns-prefetch" href="https://imagedelivery.net" />
      </head>
      <body className={`${notoSansThai.variable} antialiased`}>
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
          <Analytics />
        </ConsentProvider>
      </body>
    </html>
  );
}
