import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { TourBadgesProvider } from "@/contexts/TourBadgesContext";
import FavoritesDrawer from "@/components/home/FavoritesDrawer";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NextTrip - ทัวร์ท่องเที่ยวทั่วโลก",
    template: "%s | NextTrip",
  },
  description: "บริษัททัวร์ชั้นนำ ให้บริการจัดทัวร์ท่องเที่ยวทั้งในและต่างประเทศ ทัวร์ยุโรป ทัวร์ญี่ปุ่น ทัวร์เกาหลี พร้อมทีมงานมืออาชีพดูแลตลอดการเดินทาง",
  keywords: ["ทัวร์", "ท่องเที่ยว", "ทัวร์ต่างประเทศ", "ทัวร์ยุโรป", "ทัวร์ญี่ปุ่น", "ทัวร์เกาหลี", "บริษัททัวร์"],
  authors: [{ name: "NextTrip" }],
  creator: "NextTrip",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://nexttrip.co.th",
    siteName: "NextTrip",
    title: "NextTrip - ทัวร์ท่องเที่ยวทั่วโลก",
    description: "บริษัททัวร์ชั้นนำ ให้บริการจัดทัวร์ท่องเที่ยวทั้งในและต่างประเทศ",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextTrip - ทัวร์ท่องเที่ยวทั่วโลก",
    description: "บริษัททัวร์ชั้นนำ ให้บริการจัดทัวร์ท่องเที่ยวทั้งในและต่างประเทศ",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="http://127.0.0.1:8000" />
        <link rel="preconnect" href="https://imagedelivery.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="http://127.0.0.1:8000" />
        <link rel="dns-prefetch" href="https://imagedelivery.net" />
      </head>
      <body className={`${notoSansThai.variable} antialiased`}>
        <AuthProvider>
          <FavoritesProvider>
            <TourBadgesProvider>
            <Header />
            <main className="min-h-screen pt-[80px] lg:pt-[160px]">
              {children}
            </main>
            <Footer />
            <FavoritesDrawer />
            </TourBadgesProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
