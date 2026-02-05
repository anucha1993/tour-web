import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Phone, 
  Star, 
  ArrowRight,
  Plane,
  Shield,
  Clock,
  Award
} from "lucide-react";

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

// Popular destinations
const destinations = [
  { name: "ญี่ปุ่น", nameEn: "Japan", count: 45, image: "/images/destinations/japan.jpg", slug: "japan" },
  { name: "เกาหลี", nameEn: "Korea", count: 32, image: "/images/destinations/korea.jpg", slug: "korea" },
  { name: "ยุโรป", nameEn: "Europe", count: 28, image: "/images/destinations/europe.jpg", slug: "europe" },
  { name: "ไต้หวัน", nameEn: "Taiwan", count: 24, image: "/images/destinations/taiwan.jpg", slug: "taiwan" },
  { name: "จีน", nameEn: "China", count: 18, image: "/images/destinations/china.jpg", slug: "china" },
  { name: "เวียดนาม", nameEn: "Vietnam", count: 15, image: "/images/destinations/vietnam.jpg", slug: "vietnam" },
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-secondary-700)] text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-custom relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              ค้นหาทริปในฝัน
              <br />
              <span className="text-[var(--color-secondary-100)]">ท่องเที่ยวทั่วโลก</span>
            </h1>
            <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-xl">
              มากกว่า 500 ทัวร์จากบริษัทชั้นนำ พร้อมราคาพิเศษและทีมงานดูแลตลอดการเดินทาง
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 lg:p-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1.5">
                  จุดหมายปลายทาง
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)]" />
                  <input
                    type="text"
                    placeholder="ค้นหาประเทศ, เมือง หรือสถานที่"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-100)] text-[var(--color-gray-800)] placeholder-[var(--color-gray-400)] transition-colors"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1.5">
                  เดือนที่ต้องการเดินทาง
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)]" />
                  <select className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-100)] text-[var(--color-gray-800)] appearance-none bg-white transition-colors">
                    <option value="">ทุกช่วงเวลา</option>
                    <option value="2026-02">กุมภาพันธ์ 2026</option>
                    <option value="2026-03">มีนาคม 2026</option>
                    <option value="2026-04">เมษายน 2026</option>
                    <option value="2026-05">พฤษภาคม 2026</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                  <Search className="w-5 h-5" />
                  <span>ค้นหาทัวร์</span>
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <span className="text-sm text-[var(--color-gray-500)]">ยอดนิยม:</span>
              {["ญี่ปุ่น", "เกาหลี", "ยุโรป", "ไต้หวัน"].map((item) => (
                <Link
                  key={item}
                  href={`/tours?q=${item}`}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      {/* Popular Destinations */}
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)]">
              จุดหมายปลายทางยอดนิยม
            </h2>
            <p className="text-[var(--color-gray-500)] mt-2">
              เลือกดูทัวร์ตามประเทศที่คุณสนใจ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/tours/${dest.slug}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[var(--color-gray-200)]"
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                
                {/* Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-gray-400)]">
                  <MapPin className="w-10 h-10" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                  <h3 className="text-lg font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.count} ทัวร์</p>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/20 transition-colors z-10" />
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