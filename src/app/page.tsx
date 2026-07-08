import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { 
  Phone, 
  Search,
} from "lucide-react";
import HeroSlider from "@/components/home/HeroSlider";
import PopularCountries from "@/components/home/PopularCountries";
import SeoJsonLd from "@/components/SeoJsonLd";
import { buildMetadata } from "@/lib/seo";
import { API_URL } from "@/lib/config";

// SSR-safe dynamic imports (Server Component compatible)
const Promotions = dynamic(() => import("@/components/home/Promotions"));
const TourTabs = dynamic(() => import("@/components/home/TourTabs"));
const RecommendedTours = dynamic(() => import("@/components/home/RecommendedTours"));
const FlashSale = dynamic(() => import("@/components/home/FlashSale"));

// Client-only dynamic imports (ssr: false requires Client Component wrapper)
import { OurClients, CustomerReviews, WhyChooseUs, PopupModal, LatestBlogPosts } from "@/components/home/LazyBelowFold";

// Homepage SEO — pulled from the admin "home" settings in the DB (falls back to global).
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("home", { path: "" });
}

interface HeroSlide {
  id: number;
  url: string;
  alt: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  sort_order: number;
}

/**
 * Fetch hero slides on the server so the first slide's image is present in the
 * initial HTML. This turns the hero into a real, preloadable LCP element and
 * removes the client fetch -> hydrate -> render chain. Cached for 5 minutes.
 * Fails soft: on any error we return [] and the client component fetches instead.
 */
async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(`${API_URL}/hero-slides/public`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const heroSlides = await getHeroSlides();

  return (
    <>
      {/* JSON-LD structured data (from admin SEO) */}
      <SeoJsonLd slug="home" />

      {/* Popup Modal */}
      <PopupModal />

      {/* Hero Section with Slider */}
      <HeroSlider initialSlides={heroSlides} />

      {/* Flash Sale */}
      <FlashSale />

      {/* Customer Reviews — reserve space so this ssr:false section doesn't
          push content down when it appears on the client (prevents CLS).
          Heights measured per breakpoint: ~470 (mobile) / ~504 (md) / ~461-501 (lg+). */}
      <div className="min-h-[480px] md:min-h-[515px] lg:min-h-[510px]">
        <CustomerReviews />
      </div>

      {/* Promotions Carousel */}
      <Promotions />

      {/* Popular Destinations - Dynamic from API */}
      <PopularCountries slug="homepage" />

      {/* Tour Tabs - Dynamic from API */}
      <TourTabs />

      {/* Recommended Tours - Dynamic from API */}
      <RecommendedTours />

      {/* Why Choose Us — reserve space (prevents CLS). Heights vary a lot by
          breakpoint because the cards stack on mobile: ~952 (mobile) /
          ~584 (md) / ~436 (lg+). */}
      <div className="min-h-[965px] md:min-h-[595px] lg:min-h-[445px]">
        <WhyChooseUs />
      </div>

      {/* Our Clients */}
      <OurClients />

      {/* Latest Blog Posts */}
      <LatestBlogPosts />

      {/* CTA Section */}
      <section className="py-16 lg:py-20 gradient-hero text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            พร้อมออกเดินทางแล้วหรือยัง?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            ติดต่อทีมงานของเราวันนี้ เพื่อรับคำปรึกษาและข้อเสนอพิเศษ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tours"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-primary)] font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5" />
              ค้นหาทัวร์
            </Link>
            <a
              href="tel:021369144"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              โทร 02-136-9144
            </a>
          </div>
        </div>
      </section>
    </>
  );
}