import Link from "next/link";
import { 
  Phone, 
  Search,
} from "lucide-react";
import HeroSlider from "@/components/home/HeroSlider";
import PopularCountries from "@/components/home/PopularCountries";
import Promotions from "@/components/home/Promotions";
import TourTabs from "@/components/home/TourTabs";
import RecommendedTours from "@/components/home/RecommendedTours";
import OurClients from "@/components/home/OurClients";
import CustomerReviews from "@/components/home/CustomerReviews";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PopupModal from "@/components/home/PopupModal";

export default function HomePage() {
  return (
    <>
      {/* Popup Modal */}
      <PopupModal />

      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Promotions Carousel */}
      <Promotions />

      {/* Popular Destinations - Dynamic from API */}
      <PopularCountries slug="homepage" />

      {/* Tour Tabs - Dynamic from API */}
      <TourTabs />

      {/* Recommended Tours - Dynamic from API */}
      <RecommendedTours />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Why Choose Us */}
      <WhyChooseUs />

       {/* Our Clients */}
      <OurClients />

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