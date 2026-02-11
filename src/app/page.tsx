import Link from "next/link";
import { 
  Phone, 
  Star, 
  ArrowRight,
  Plane,
  Shield,
  Clock,
  Award,
  MapPin,
  Calendar,
  Search,
} from "lucide-react";
import HeroSlider from "@/components/home/HeroSlider";
import PopularCountries from "@/components/home/PopularCountries";
import Promotions from "@/components/home/Promotions";
import TourTabs from "@/components/home/TourTabs";
import RecommendedTours from "@/components/home/RecommendedTours";
import OurClients from "@/components/home/OurClients";
import PopupModal from "@/components/home/PopupModal";

// Why choose us features
const features = [
  {
    icon: Shield,
    title: "ใบอนุญาตถูกต้อง",
    description: "ได้รับใบอนุญาตจาก ททท. และ กรมการท่องเที่ยว",
  },
  {
    icon: Award,
    title: "ประสบการณ์กว่า 10 ปี",
    description: "ทีมงานมืออาชีพพร้อมดูแลตลอดการเดินทาง",
  },
  {
    icon: Clock,
    title: "บริการ 24 ชั่วโมง",
    description: "ติดต่อเราได้ตลอดเวลาทั้งก่อนและระหว่างเดินทาง",
  },
  {
    icon: Plane,
    title: "สายการบินชั้นนำ",
    description: "ร่วมกับสายการบินชั้นนำระดับโลก",
  },
];

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

     

      {/* Why Choose Us */}
      <section className="py-16 lg:py-20 bg-[var(--color-primary-50)]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)]">
              ทำไมต้องเลือกเรา?
            </h2>
            <p className="text-[var(--color-gray-500)] mt-2">
              NextTrip พร้อมให้บริการคุณด้วยมาตรฐานสูงสุด
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-gray-800)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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