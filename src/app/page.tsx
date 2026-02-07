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

// Sample featured tours data (hardcoded for performance)
const featuredTours = [
  {
    id: 1,
    slug: "japan-sakura-7d5n",
    title: "ญี่ปุ่น โตเกียว ฟูจิ ชมซากุระ",
    destination: "ญี่ปุ่น",
    duration: "7 วัน 5 คืน",
    price: 45900,
    originalPrice: 49900,
    image: "/images/tours/japan.jpg",
    rating: 4.8,
    reviews: 124,
    departure: "มี.ค. - เม.ย. 2026",
  },
  {
    id: 2,
    slug: "korea-winter-6d4n",
    title: "เกาหลี โซล เกาะนามิ สกีรีสอร์ท",
    destination: "เกาหลี",
    duration: "6 วัน 4 คืน",
    price: 32900,
    originalPrice: 35900,
    image: "/images/tours/korea.jpg",
    rating: 4.7,
    reviews: 89,
    departure: "ธ.ค. 2025 - ก.พ. 2026",
  },
  {
    id: 3,
    slug: "europe-classic-10d7n",
    title: "ยุโรปตะวันตก ฝรั่งเศส สวิส อิตาลี",
    destination: "ยุโรป",
    duration: "10 วัน 7 คืน",
    price: 89900,
    originalPrice: 99900,
    image: "/images/tours/europe.jpg",
    rating: 4.9,
    reviews: 56,
    departure: "ต.ค. - พ.ย. 2026",
  },
  {
    id: 4,
    slug: "taiwan-classic-5d4n",
    title: "ไต้หวัน ไทเป ทะเลสาบสุริยันจันทรา",
    destination: "ไต้หวัน",
    duration: "5 วัน 4 คืน",
    price: 22900,
    originalPrice: null,
    image: "/images/tours/taiwan.jpg",
    rating: 4.6,
    reviews: 203,
    departure: "ทุกเดือน",
  },
];

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
      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Promotions Carousel */}
      <Promotions />

      {/* Popular Destinations - Dynamic from API */}
      <PopularCountries slug="homepage" />

      {/* Featured Tours */}
      <section className="py-16 lg:py-20 bg-[var(--color-gray-50)]">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)]">
                ทัวร์แนะนำ
              </h2>
              <p className="text-[var(--color-gray-500)] mt-1">
                ทัวร์ยอดนิยมที่คัดสรรมาเพื่อคุณ
              </p>
            </div>
            <Link
              href="/tours"
              className="flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors"
            >
              ดูทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-[var(--color-gray-200)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  {/* Placeholder - replace with actual image */}
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--color-gray-400)]">
                    <Plane className="w-12 h-12" />
                  </div>
                  
                  {/* Discount badge */}
                  {tour.originalPrice && (
                    <div className="absolute top-3 left-3 z-20 bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded">
                      ลด {Math.round((1 - tour.price / tour.originalPrice) * 100)}%
                    </div>
                  )}
                  
                  {/* Destination */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 text-white text-sm">
                    <MapPin className="w-4 h-4" />
                    {tour.destination}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--color-gray-800)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[48px]">
                    {tour.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-gray-500)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {tour.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {tour.rating}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-[var(--color-gray-500)]">เริ่มต้น</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[var(--color-primary)]">
                        ฿{tour.price.toLocaleString()}
                      </span>
                      {tour.originalPrice && (
                        <span className="text-sm text-[var(--color-gray-400)] line-through">
                          ฿{tour.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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