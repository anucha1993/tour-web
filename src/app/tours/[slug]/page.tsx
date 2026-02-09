'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Calendar, Clock, Plane, Star, Heart, Share2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Users, Tag, Utensils, Hotel, Shield, X,
  Coffee, Sun, Moon, FileText, Download,
  Eye, Sparkles, ShoppingBag, UtensilsCrossed, Gift,
  Check, Minus, AlertCircle, ArrowLeft,
} from 'lucide-react';
import {
  tourDetailApi,
  TourDetail,
  TourDetailPeriod,
  TourDetailItinerary,
} from '@/lib/api';
import FavoriteButton from '@/components/home/FavoriteButton';

// ===== Helper Components =====

function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[color] || colorMap.blue}`}>
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, id }: { icon: React.ElementType; title: string; id?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-800 mb-4 scroll-mt-24">
      <Icon className="w-5 h-5 text-[var(--color-primary)]" />
      {title}
    </h2>
  );
}

// Theme / suitable_for label maps
const THEME_LABELS: Record<string, string> = {
  SHOPPING: 'ช้อปปิ้ง', CULTURE: 'วัฒนธรรม', TEMPLE: 'ไหว้พระ', NATURE: 'ธรรมชาติ',
  BEACH: 'ทะเล', ADVENTURE: 'ผจญภัย', HONEYMOON: 'ฮันนีมูน', FAMILY: 'ครอบครัว',
  PREMIUM: 'พรีเมียม', BUDGET: 'ประหยัด',
};
const SUITABLE_LABELS: Record<string, string> = {
  FAMILY: 'ครอบครัว', COUPLE: 'คู่รัก', GROUP: 'กรุ๊ปทัวร์', SOLO: 'เดี่ยว', SENIOR: 'ผู้สูงอายุ', KIDS: 'เด็ก',
};
const BADGE_LABELS: Record<string, { text: string; color: string }> = {
  HOT: { text: '🔥 HOT', color: 'red' },
  NEW: { text: '✨ ใหม่', color: 'blue' },
  BEST_SELLER: { text: '🏆 ขายดี', color: 'orange' },
  PROMOTION: { text: '🎉 โปรโมชั่น', color: 'green' },
  LIMITED: { text: '⏰ จำนวนจำกัด', color: 'purple' },
};

// ===== Gallery Component =====
function GalleryViewer({ images, coverUrl }: { images: TourDetail['gallery']; coverUrl: string | null }) {
  const allImages = coverUrl
    ? [{ url: coverUrl, thumbnail_url: null, alt: 'Cover', caption: null }, ...images]
    : images;
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (allImages.length === 0) return null;

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
        {/* Main image */}
        <div
          className="relative aspect-[16/9] sm:aspect-[2/1] cursor-pointer"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={allImages[current].url}
            alt={allImages[current].alt || 'Tour image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority={current === 0}
          />
          {/* Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + allImages.length) % allImages.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % allImages.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {current + 1} / {allImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-1.5 p-2 overflow-x-auto">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition ${
                  idx === current ? 'border-[var(--color-primary)]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.thumbnail_url || img.url}
                  alt={img.alt || `Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full cursor-pointer" onClick={() => setLightbox(false)}>
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/9] mx-4" onClick={e => e.stopPropagation()}>
            <Image
              src={allImages[current].url}
              alt={allImages[current].alt || ''}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + allImages.length) % allImages.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % allImages.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ===== Period / Price Table =====
function PeriodTable({ periods }: { periods: TourDetailPeriod[] }) {
  const [expanded, setExpanded] = useState(false);
  const display = expanded ? periods : periods.slice(0, 6);

  if (periods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>ไม่มีรอบเดินทางในขณะนี้</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    available: 'text-green-600 bg-green-50',
    booking: 'text-yellow-600 bg-yellow-50',
    sold_out: 'text-red-600 bg-red-50',
  };
  const statusLabels: Record<string, string> = {
    available: 'ว่าง',
    booking: 'จองได้',
    sold_out: 'เต็ม',
  };
  const guaranteeLabels: Record<string, { label: string; color: string }> = {
    guaranteed: { label: 'การันตี', color: 'text-green-600' },
    pending: { label: 'รอยืนยัน', color: 'text-yellow-600' },
    cancelled: { label: 'ยกเลิก', color: 'text-red-600' },
  };

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left px-4 py-3 font-semibold rounded-tl-lg">วันเดินทาง</th>
              <th className="text-right px-4 py-3 font-semibold">ราคาผู้ใหญ่</th>
              <th className="text-right px-4 py-3 font-semibold">ราคาเด็ก</th>
              <th className="text-right px-4 py-3 font-semibold">พักเดี่ยว</th>
              <th className="text-center px-4 py-3 font-semibold">ที่นั่ง</th>
              <th className="text-center px-4 py-3 font-semibold">สถานะ</th>
              <th className="text-center px-4 py-3 font-semibold rounded-tr-lg">การันตี</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {display.map((period) => {
              const offer = period.offer;
              const startD = new Date(period.start_date);
              const endD = new Date(period.end_date);
              return (
                <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {startD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      {' - '}
                      {endD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {offer ? (
                      <div>
                        {offer.discount_adult > 0 && (
                          <span className="text-xs text-gray-400 line-through block">฿{offer.price_adult.toLocaleString()}</span>
                        )}
                        <span className={`font-bold ${offer.discount_adult > 0 ? 'text-red-500' : 'text-gray-800'}`}>
                          ฿{offer.net_price_adult.toLocaleString()}
                        </span>
                      </div>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {offer?.price_child ? (
                      <span className="text-gray-700">฿{(offer.price_child - offer.discount_child_bed).toLocaleString()}</span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {offer?.price_single ? (
                      <span className="text-gray-700">+฿{(offer.price_single - offer.discount_single).toLocaleString()}</span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-gray-600">{period.available}/{period.capacity}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[period.sale_status] || 'text-gray-600 bg-gray-50'}`}>
                      {statusLabels[period.sale_status] || period.sale_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium ${guaranteeLabels[period.guarantee_status]?.color || 'text-gray-500'}`}>
                      {guaranteeLabels[period.guarantee_status]?.label || period.guarantee_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {display.map((period) => {
          const offer = period.offer;
          const startD = new Date(period.start_date);
          const endD = new Date(period.end_date);
          return (
            <div key={period.id} className="border border-gray-100 rounded-xl p-4 hover:border-[var(--color-primary-200)] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  {startD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {endD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[period.sale_status] || ''}`}>
                  {statusLabels[period.sale_status] || period.sale_status}
                </span>
              </div>
              {offer && (
                <div className="flex items-end justify-between">
                  <div>
                    {offer.discount_adult > 0 && (
                      <span className="text-xs text-gray-400 line-through mr-2">฿{offer.price_adult.toLocaleString()}</span>
                    )}
                    <span className={`text-lg font-bold ${offer.discount_adult > 0 ? 'text-red-500' : 'text-[var(--color-primary)]'}`}>
                      ฿{offer.net_price_adult.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">ว่าง {period.available} ที่</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {periods.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] rounded-lg transition cursor-pointer"
        >
          {expanded ? (
            <>แสดงน้อยลง <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>ดูรอบเดินทางทั้งหมด ({periods.length} รอบ) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}

// ===== Itinerary Component =====
function ItinerarySection({ itineraries }: { itineraries: TourDetailItinerary[] }) {
  const [openDay, setOpenDay] = useState<number | null>(itineraries.length > 0 ? itineraries[0].day_number : null);

  if (itineraries.length === 0) return null;

  return (
    <div className="space-y-3">
      {itineraries.map((day) => (
        <div key={day.day_number} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenDay(openDay === day.day_number ? null : day.day_number)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-9 h-9 bg-[var(--color-primary)] text-white rounded-lg flex items-center justify-center text-sm font-bold">
                {day.day_number}
              </span>
              <span className="font-semibold text-gray-800 text-left text-sm sm:text-base">{day.title}</span>
            </div>
            {openDay === day.day_number ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {openDay === day.day_number && (
            <div className="px-4 pb-4 pt-1">
              {day.description && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-3">{day.description}</p>
              )}

              {/* Meals */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${day.has_breakfast ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <Coffee className="w-3 h-3" />
                  เช้า
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${day.has_lunch ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <Sun className="w-3 h-3" />
                  กลางวัน
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${day.has_dinner ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <Moon className="w-3 h-3" />
                  เย็น
                </span>
                {day.meals_note && <span className="text-xs text-gray-500 self-center">({day.meals_note})</span>}
              </div>

              {/* Accommodation */}
              {day.accommodation && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-blue-50 px-3 py-2 rounded-lg">
                  <Hotel className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">{day.accommodation}</span>
                  {day.hotel_star && (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: day.hotel_star }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </span>
                  )}
                </div>
              )}

              {/* Places */}
              {day.places && day.places.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {day.places.map((place, i) => (
                    <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3 inline mr-0.5" />
                      {place}
                    </span>
                  ))}
                </div>
              )}

              {/* Images */}
              {day.images && day.images.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {day.images.map((img, i) => (
                    <div key={i} className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image src={img} alt={`Day ${day.day_number} - ${i + 1}`} fill className="object-cover" sizes="128px" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== Transport Section =====
function TransportSection({ transports }: { transports: TourDetail['transports'] }) {
  if (transports.length === 0) return null;

  const outbound = transports.filter(t => t.transport_type === 'outbound');
  const inbound = transports.filter(t => t.transport_type === 'inbound');
  const domestic = transports.filter(t => t.transport_type === 'domestic');

  const renderFlight = (t: TourDetail['transports'][0]) => (
    <div key={`${t.flight_no}-${t.route_from}-${t.route_to}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
      {t.airline?.image && (
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image src={t.airline.image} alt={t.airline.name} fill className="object-contain" sizes="40px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-800">{t.route_from}</span>
          <Plane className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          <span className="font-semibold text-gray-800">{t.route_to}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {t.flight_no && <span className="mr-2">{t.flight_no}</span>}
          {t.depart_time && <span>{t.depart_time}</span>}
          {t.arrive_time && <span> → {t.arrive_time}</span>}
          {t.airline?.name && <span className="ml-2 text-gray-400">({t.airline.name})</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {outbound.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">✈️ ขาไป</h4>
          <div className="space-y-2">{outbound.map(renderFlight)}</div>
        </div>
      )}
      {inbound.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">✈️ ขากลับ</h4>
          <div className="space-y-2">{inbound.map(renderFlight)}</div>
        </div>
      )}
      {domestic.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">🛫 ภายในประเทศ</h4>
          <div className="space-y-2">{domestic.map(renderFlight)}</div>
        </div>
      )}
    </div>
  );
}

// ===== Sticky Nav =====
const NAV_ITEMS = [
  { id: 'overview', label: 'ภาพรวม' },
  { id: 'periods', label: 'รอบเดินทาง' },
  { id: 'itinerary', label: 'โปรแกรมทัวร์' },
  { id: 'highlights', label: 'ไฮไลท์' },
  { id: 'conditions', label: 'เงื่อนไข' },
];

function StickyNav({ activeSection }: { activeSection: string }) {
  return (
    <div className="sticky top-[80px] lg:top-[160px] z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container-custom">
        <nav className="flex gap-0 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {NAV_ITEMS.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSection === item.id
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function TourDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const viewRecorded = useRef(false);

  // Fetch tour data
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    tourDetailApi.get(slug).then(res => {
      if (res.success && res.data) {
        setTour(res.data);
      } else {
        setError(res.message || 'ไม่พบทัวร์ที่ต้องการ');
      }
    }).catch(() => {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }).finally(() => setLoading(false));
  }, [slug]);

  // Record view (once per page load)
  useEffect(() => {
    if (!slug || viewRecorded.current) return;
    viewRecorded.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    tourDetailApi.recordView(slug, {
      referrer: document.referrer || undefined,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
    });
  }, [slug]);

  // Intersection observer for sticky nav
  useEffect(() => {
    const sections = NAV_ITEMS.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-200px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [tour]);

  // Loading state  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังโหลดข้อมูลทัวร์...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-700 mb-2">ไม่พบทัวร์</h1>
          <p className="text-gray-500 mb-6">{error || 'ทัวร์ที่คุณต้องการอาจถูกลบหรือปิดการแสดงผลแล้ว'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition">
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent = tour.max_discount_percent ? Math.round(tour.max_discount_percent) : 0;
  const badgeInfo = tour.badge ? BADGE_LABELS[tour.badge] : null;
  const favTourData = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    image_url: tour.cover_image_url,
    price: tour.min_price,
    country_name: tour.primary_country?.name || '',
    days: tour.duration_days,
    nights: tour.duration_nights,
    tour_code: tour.tour_code,
  };

  return (
    <>
      {/* Sticky Navigation */}
      <StickyNav activeSection={activeSection} />

      <div className="bg-gray-50 pb-16">
        <div className="container-custom py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">หน้าหลัก</Link>
            <span>/</span>
            {tour.primary_country && (
              <>
                <span>{tour.primary_country.flag_emoji} {tour.primary_country.name}</span>
                <span>/</span>
              </>
            )}
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{tour.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ===== LEFT COLUMN (2/3) ===== */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gallery */}
              <GalleryViewer images={tour.gallery} coverUrl={tour.cover_image_url} />

              {/* OVERVIEW SECTION */}
              <section id="overview" className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                {/* Title & badges */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{tour.tour_code}</span>
                      {badgeInfo && <Badge color={badgeInfo.color}>{badgeInfo.text}</Badge>}
                      {discountPercent > 0 && <Badge color="red">ลด {discountPercent}%</Badge>}
                      {tour.promotion_type === 'fire_sale' && <Badge color="red">🔥 โปรไฟไหม้</Badge>}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{tour.title}</h1>
                  </div>
                  <FavoriteButton tour={favTourData} size="md" />
                </div>

                {/* Quick info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 mb-4 pb-4 border-b border-gray-100">
                  {tour.countries.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                      {tour.countries.map(c => `${c.flag_emoji || ''} ${c.name}`).join(', ')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                    {tour.duration_days} วัน {tour.duration_nights} คืน
                  </span>
                  {(tour.hotel_star_min || tour.hotel_star_max || tour.hotel_star) && (
                    <span className="flex items-center gap-1">
                      <Hotel className="w-4 h-4 text-[var(--color-primary)]" />
                      {tour.hotel_star_min && tour.hotel_star_max && tour.hotel_star_min !== tour.hotel_star_max
                        ? `${tour.hotel_star_min}-${tour.hotel_star_max} ดาว`
                        : `${tour.hotel_star || tour.hotel_star_max || tour.hotel_star_min} ดาว`}
                    </span>
                  )}
                  {tour.departure_airports && tour.departure_airports.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Plane className="w-4 h-4 text-[var(--color-primary)]" />
                      {tour.departure_airports.join(', ')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {tour.view_count.toLocaleString()} เข้าชม
                  </span>
                </div>

                {/* Cities */}
                {tour.cities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">เมืองที่เที่ยว</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {tour.cities.map(c => (
                        <span key={c.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          <MapPin className="w-3 h-3 inline mr-0.5" />{c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {tour.themes && tour.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tour.themes.map(t => (
                        <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                          {THEME_LABELS[t] || t}
                        </span>
                      ))}
                    </div>
                  )}
                  {tour.suitable_for && tour.suitable_for.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tour.suitable_for.map(s => (
                        <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                          <Users className="w-3 h-3 inline mr-0.5" />{SUITABLE_LABELS[s] || s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                {tour.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{tour.description}</p>
                  </div>
                )}

                {/* Hashtags */}
                {tour.hashtags && tour.hashtags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tour.hashtags.map((h, i) => (
                      <span key={i} className="text-xs text-[var(--color-primary)] font-medium">
                        #{h}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* PERIODS SECTION */}
              <section id="periods" className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <SectionTitle icon={Calendar} title="รอบเดินทาง & ราคา" id="periods-heading" />
                <PeriodTable periods={tour.periods} />
              </section>

              {/* ITINERARY SECTION */}
              {tour.itineraries.length > 0 && (
                <section id="itinerary" className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <SectionTitle icon={MapPin} title="โปรแกรมทัวร์" id="itinerary-heading" />
                  <ItinerarySection itineraries={tour.itineraries} />
                </section>
              )}

              {/* HIGHLIGHTS SECTION */}
              <section id="highlights" className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <SectionTitle icon={Sparkles} title="ไฮไลท์" id="highlights-heading" />

                {/* Main highlights */}
                {tour.highlights && tour.highlights.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500" /> จุดเด่นของทัวร์
                    </h4>
                    <ul className="space-y-1.5">
                      {tour.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Shopping highlights */}
                {tour.shopping_highlights && tour.shopping_highlights.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-pink-500" /> ช้อปปิ้ง
                    </h4>
                    <ul className="space-y-1.5">
                      {tour.shopping_highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Food highlights */}
                {tour.food_highlights && tour.food_highlights.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-4 h-4 text-orange-500" /> อาหาร
                    </h4>
                    <ul className="space-y-1.5">
                      {tour.food_highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Special highlights */}
                {tour.special_highlights && tour.special_highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-red-500" /> พิเศษ
                    </h4>
                    <ul className="space-y-1.5">
                      {tour.special_highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Transports */}
                {tour.transports.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                      <Plane className="w-4 h-4 text-blue-500" /> สายการบิน
                    </h4>
                    <TransportSection transports={tour.transports} />
                  </div>
                )}
              </section>

              {/* CONDITIONS SECTION */}
              <section id="conditions" className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <SectionTitle icon={Shield} title="เงื่อนไข & ข้อตกลง" id="conditions-heading" />
                
                <div className="space-y-5">
                  {tour.inclusions && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> รวมในราคาทัวร์
                      </h4>
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-green-50/50 p-4 rounded-xl">
                        {tour.inclusions}
                      </div>
                    </div>
                  )}

                  {tour.exclusions && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                        <Minus className="w-4 h-4" /> ไม่รวมในราคาทัวร์
                      </h4>
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-red-50/50 p-4 rounded-xl">
                        {tour.exclusions}
                      </div>
                    </div>
                  )}

                  {tour.conditions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> เงื่อนไขการจอง
                      </h4>
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl">
                        {tour.conditions}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ===== RIGHT COLUMN (sidebar 1/3) ===== */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-[220px] space-y-4">
                {/* Price Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-[var(--color-primary)]">
                  <p className="text-xs text-gray-500 mb-1">ราคาเริ่มต้น</p>
                  {tour.discount_adult && tour.discount_adult > 0 ? (
                    <div>
                      <span className="text-sm text-gray-400 line-through">
                        ฿{((tour.min_price || 0) + tour.discount_adult).toLocaleString()}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-red-500">฿{tour.min_price?.toLocaleString() || '-'}</span>
                        <span className="text-sm text-gray-500">/ท่าน</span>
                      </div>
                      {discountPercent > 0 && (
                        <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          ประหยัด {discountPercent}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[var(--color-primary)]">
                        {tour.min_price ? `฿${tour.min_price.toLocaleString()}` : 'สอบถาม'}
                      </span>
                      {tour.min_price && <span className="text-sm text-gray-500">/ท่าน</span>}
                    </div>
                  )}

                  {/* Next departure */}
                  {tour.next_departure_date && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">เดินทางใกล้สุด</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(tour.next_departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {/* Seats info */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      เหลือ {tour.available_seats} ที่
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {tour.total_departures} รอบ
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 space-y-2">
                    <a
                      href="#periods"
                      className="block w-full text-center py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition cursor-pointer"
                    >
                      ดูรอบเดินทาง
                    </a>
                    {tour.pdf_url && (
                      <a
                        href={tour.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลด PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">ข้อมูลทัวร์</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">ประเทศ</p>
                        <p className="text-gray-700">{tour.countries.map(c => c.name).join(', ') || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">ระยะเวลา</p>
                        <p className="text-gray-700">{tour.duration_days} วัน {tour.duration_nights} คืน</p>
                      </div>
                    </div>
                    {(tour.hotel_star || tour.hotel_star_max) && (
                      <div className="flex items-center gap-3">
                        <Hotel className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400">โรงแรม</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: tour.hotel_star || tour.hotel_star_max || 0 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {tour.transports.length > 0 && (() => {
                      const airlines = [...new Set(tour.transports.filter(t => t.airline).map(t => t.airline!.name))];
                      if (airlines.length === 0) return null;
                      return (
                        <div className="flex items-center gap-3">
                          <Plane className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">สายการบิน</p>
                            <p className="text-gray-700">{airlines.join(', ')}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Share */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">แชร์ทัวร์นี้</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: tour.title, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('คัดลอกลิงก์แล้ว!');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      แชร์
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
