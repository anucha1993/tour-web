'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Calendar, Clock, Plane, Star, Share2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Users, Hotel, Shield, X,
  Coffee, Sun, Moon, FileText, Download,
  Eye, Sparkles, ShoppingBag, UtensilsCrossed, Gift,
  Check, Minus, AlertCircle, ArrowLeft, Building2,
  ImageIcon,
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

// ===== Gallery Component (Viator-style: thumbnails left + main image) =====
const THUMBNAIL_SLOTS = 9; // Always show 6 thumbnail slots including main image

function ViatorGallery({ images, galleryImages, coverUrl, coverAlt, title }: {
  images: TourDetail['gallery'];
  galleryImages: TourDetail['gallery_images'];
  coverUrl: string | null;
  coverAlt: string | null;
  title: string;
}) {
  // Combine: cover image + tour gallery + gallery_images (from hashtags/cities/countries)
  // Deduplicate by URL
  const coverItem = coverUrl
    ? [{ url: coverUrl, thumbnail_url: null, alt: coverAlt || 'Cover', caption: null }]
    : [];
  const combined = [...coverItem, ...images, ...galleryImages];
  const seen = new Set<string>();
  const allImages = combined.filter(img => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // How many placeholders needed to fill 4 thumbnail slots
  const placeholderCount = Math.max(0, THUMBNAIL_SLOTS - allImages.length);

  return (
    <>
      <div className="flex bg-gray-100 overflow-hidden rounded-lg sm:rounded-none">
        {/* Thumbnails - left side (always show 6 slots) */}
        <div className="hidden sm:flex flex-col gap-0.5 p-1 bg-gray-50 w-[76px] flex-shrink-0">
          {/* Actual images */}
          {allImages.slice(0, THUMBNAIL_SLOTS).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-full aspect-square rounded overflow-hidden cursor-pointer border-2 transition ${
                current === idx ? 'border-orange-500' : 'border-transparent hover:border-orange-300'
              }`}
            >
              <Image
                src={img.thumbnail_url || img.url}
                alt={img.alt || `Image ${idx + 1}`}
                width={150}
                height={150}
                className="w-full h-full object-cover"
                quality={85}
              />
            </button>
          ))}
          {/* Placeholder slots if not enough images */}
          {[...Array(placeholderCount)].map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="w-full aspect-square rounded overflow-hidden border-2 border-transparent"
            >
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
          {/* "+N more" button if more than 6 images */}
          {allImages.length > THUMBNAIL_SLOTS && (
            <button
              onClick={() => setLightbox(true)}
              className="aspect-square rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-300 bg-gray-200 flex items-center justify-center"
            >
              <span className="text-xs text-gray-500 font-medium">+{allImages.length - THUMBNAIL_SLOTS}</span>
            </button>
          )}
        </div>

        {/* Main Image - shows full image without cropping */}
        <div
          className="relative flex-1 min-h-[350px] sm:min-h-[450px] lg:min-h-[520px] cursor-pointer bg-white"
          onClick={() => allImages.length > 0 && setLightbox(true)}
        >
          {allImages.length > 0 ? (
            <Image
              src={allImages[current].url}
              alt={allImages[current].alt || title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 55vw, 700px"
              quality={90}
              priority={current === 0}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-amber-300">
              <ImageIcon className="w-16 h-16 text-white/50" />
            </div>
          )}
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
          {allImages.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {allImages.length}
            </div>
          )}
          {/* Share & Wishlist */}
        
        </div>
      </div>

      {/* Mobile thumbnails */}
      <div className="sm:hidden flex gap-1.5 px-4 mt-2 overflow-x-auto pb-1">
        {allImages.length > 0 ? (
          allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition ${
                idx === current ? 'border-orange-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.thumbnail_url || img.url}
                alt={img.alt || `Image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))
        ) : (
          [...Array(THUMBNAIL_SLOTS)].map((_, idx) => (
            <div
              key={`m-placeholder-${idx}`}
              className="w-14 h-14 flex-shrink-0 rounded-md bg-gray-200 flex items-center justify-center"
            >
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          ))
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
          {/* Lightbox thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto pb-1">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                className={`relative w-14 h-11 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 transition ${
                  idx === current ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <Image src={img.thumbnail_url || img.url} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
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
            <div key={period.id} className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 transition-colors">
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
                    <span className={`text-lg font-bold ${offer.discount_adult > 0 ? 'text-red-500' : 'text-orange-500'}`}>
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
          className="mt-4 w-full flex items-center justify-center gap-1 py-2.5 text-sm font-medium text-orange-500 hover:bg-orange-50 rounded-lg transition cursor-pointer"
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
              <span className="flex-shrink-0 w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
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

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${day.has_breakfast ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <Coffee className="w-3 h-3" /> เช้า
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${day.has_lunch ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <Sun className="w-3 h-3" /> กลางวัน
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${day.has_dinner ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <Moon className="w-3 h-3" /> เย็น
                </span>
                {day.meals_note && <span className="text-xs text-gray-500 self-center">({day.meals_note})</span>}
              </div>

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

              {day.places && day.places.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {day.places.map((place, i) => (
                    <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3 inline mr-0.5" />{place}
                    </span>
                  ))}
                </div>
              )}

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
        <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.airline.image} alt={t.airline.name} className="w-full h-full object-contain" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-800">{t.route_from}</span>
          <Plane className="w-3.5 h-3.5 text-orange-500" />
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

// ===== Detail Tab Types =====
type DetailTab = 'detail' | 'periods' | 'itinerary' | 'conditions';

// ===== Main Page =====
export default function TourDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('detail');
  const viewRecorded = useRef(false);

  // Fetch tour data
  useEffect(() => {
    if (!slug || slug === 'null' || slug === 'undefined') {
      setError('ไม่พบทัวร์ที่ต้องการ');
      setLoading(false);
      return;
    }
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

  // Record view
  useEffect(() => {
    if (!slug || slug === 'null' || slug === 'undefined' || viewRecorded.current) return;
    viewRecorded.current = true;
    const urlParams = new URLSearchParams(window.location.search);
    tourDetailApi.recordView(slug, {
      referrer: document.referrer || undefined,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
    });
  }, [slug]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังโหลดข้อมูลทัวร์...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-700 mb-2">ไม่พบทัวร์</h1>
          <p className="text-gray-500 mb-6">{error || 'ทัวร์ที่คุณต้องการอาจถูกลบหรือปิดการแสดงผลแล้ว'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition">
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

  const airlines = [...new Set(tour.transports.filter(t => t.airline).map(t => t.airline!.name))];
  const firstAirline = tour.transports.find(t => t.airline?.image)?.airline;

  const nextDeparture = tour.periods.length > 0
    ? tour.periods.reduce((nearest, p) => {
        const d = new Date(p.start_date);
        return d < nearest ? d : nearest;
      }, new Date(tour.periods[0].start_date))
    : null;

  const TABS: { id: DetailTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'detail', label: 'รายละเอียดทัวร์', icon: FileText },
    { id: 'periods', label: 'ช่วงเวลาการเดินทาง', icon: Calendar, count: tour.periods.length || undefined },
    { id: 'itinerary', label: 'โปรแกรมทัวร์', icon: MapPin, count: tour.itineraries.length || undefined },
    { id: 'conditions', label: 'เงื่อนไข', icon: Shield },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-orange-500 transition">หน้าหลัก</Link>
          <span>/</span>
          {tour.primary_country && (
            <>
              <span>{tour.primary_country.flag_emoji} {tour.primary_country.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{tour.title}</span>
        </nav>

        {/* ===== Viator-Style Main Card ===== */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* ---- Title Section ---- */}
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{tour.tour_code}</span>
              {badgeInfo && <Badge color={badgeInfo.color}>{badgeInfo.text}</Badge>}
              {discountPercent > 0 && <Badge color="red">ลด {discountPercent}%</Badge>}
              {tour.promotion_type === 'fire_sale' && <Badge color="red">🔥 โปรไฟไหม้</Badge>}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-snug">
              {tour.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {(tour.hotel_star || tour.hotel_star_max) && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {[...Array(tour.hotel_star || tour.hotel_star_max || 0)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - (tour.hotel_star || tour.hotel_star_max || 0))].map((_, i) => (
                    <Star key={`e-${i}`} className="w-4 h-4 text-gray-200" />
                  ))}
                </div>
              )}

              <span className="flex items-center gap-1 text-gray-500">
                <Eye className="w-4 h-4" />
                {tour.view_count.toLocaleString()} เข้าชม
              </span>

              <span className="text-gray-300 hidden sm:inline">|</span>

              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {tour.countries.map(c => `${c.flag_emoji || ''} ${c.name}`).join(', ') || 'ประเทศ'}
              </span>

              {tour.cities.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {tour.cities.slice(0, 3).map(city => (
                    <span key={city.id} className="text-xs text-orange-700 bg-gradient-to-r from-orange-100 to-amber-100 px-2 py-0.5 rounded-full font-medium">
                      {city.name}
                    </span>
                  ))}
                  {tour.cities.length > 3 && (
                    <span className="text-xs text-gray-500">+{tour.cities.length - 3}</span>
                  )}
                </div>
              )}

              <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded hidden sm:inline-block ${
                tour.tour_category === 'premium'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : tour.tour_category === 'budget'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}>
                {tour.tour_category === 'premium' ? '✨ พรีเมียม' : tour.tour_category === 'budget' ? '💰 ราคาดี' : 'ทั่วไป'}
              </span>
            </div>
          </div>

          {/* ---- Gallery + Price Panel ---- */}
          <div className="flex flex-col lg:flex-row">
            {/* Gallery - Square image with thumbnails */}
            <div className="lg:w-[55%] lg:flex-shrink-0">
              <ViatorGallery
                images={tour.gallery}
                galleryImages={tour.gallery_images || []}
                coverUrl={tour.cover_image_url}
                coverAlt={tour.cover_image_alt}
                title={tour.title}
              />
            </div>

            {/* Price & Booking Panel */}
            <div className="flex-1 p-4 sm:p-5 lg:border-l border-t lg:border-t-0 border-gray-100">
              {/* Promo badge */}
              {tour.promotion_type === 'fire_sale' && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs rounded mb-3">
                  <Clock className="w-3 h-3" />
                  🔥 โปรไฟไหม้
                </div>
              )}
              {discountPercent > 0 && tour.promotion_type !== 'fire_sale' && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs rounded mb-3">
                  <Sparkles className="w-3 h-3" />
                  ส่วนลด {discountPercent}%
                </div>
              )}

              {/* Price */}
              <div className="mb-3">
                <span className="text-sm text-gray-500">เริ่มต้น</span>
                <div className="flex items-baseline gap-2">
                  {discountPercent > 0 && <span className="text-red-500 text-sm font-medium">-{discountPercent}%</span>}
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {tour.min_price ? `฿${tour.min_price.toLocaleString()}` : 'สอบถาม'}
                  </span>
                  {tour.min_price && <span className="text-sm text-gray-500">ต่อท่าน</span>}
                </div>
                {tour.discount_adult && tour.discount_adult > 0 && tour.price_adult && (
                  <div className="text-sm text-gray-400">
                    ราคาปกติ <span className="line-through">฿{tour.price_adult.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {tour.periods.some(p => p.offer?.price_child && p.offer.price_child > 0) && (
                <div className="flex items-center gap-1 text-xs text-green-600 mb-4">
                  <Check className="w-3 h-3" />
                  ราคาพิเศษสำหรับเด็ก
                </div>
              )}

              {/* Quick info cards */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 p-2 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">วันเดินทาง</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {nextDeparture
                      ? nextDeparture.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
                      : '-'
                    }
                  </div>
                </div>
                <div className="flex-1 p-2 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">ที่นั่งว่าง</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    {tour.available_seats} ที่นั่ง
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setActiveTab('periods')}
                  className="block w-full text-center py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  ตรวจสอบที่ว่าง
                </button>
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

              {/* Benefits */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">ยกเลิกฟรี</span>
                    <span className="text-gray-600"> ล่วงหน้า 24 ชม.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">จองก่อน จ่ายทีหลัง</span>
                    <span className="text-gray-600"> - พร้อมความยืดหยุ่น</span>
                  </div>
                </div>
              </div>

              {/* Book ahead */}
              {nextDeparture && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">จองล่วงหน้า!</div>
                    <div className="text-xs text-gray-500">
                      เดินทางใกล้สุด {nextDeparture.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              )}

              {/* Favorite & Share */}
              <div className="mt-4 flex items-center gap-2">
                <FavoriteButton tour={favTourData} size="md" />
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

          {/* ---- Bottom Features Row ---- */}
          <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-2 font-mono bg-gray-200 px-2 py-1 rounded text-xs">
                🏷️ {tour.tour_code}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {tour.duration_days} วัน {tour.duration_nights} คืน
              </span>
              {airlines.length > 0 && (
                <span className="flex items-center gap-1.5">
                  {firstAirline?.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={firstAirline.image} alt={firstAirline.name} className="h-3 w-auto object-contain" />
                  ) : (
                    <Plane className="w-4 h-4" />
                  )}
                  <span>{airlines.join(', ')}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                ที่นั่ง: {tour.periods.reduce((s, p) => s + p.booked, 0)}/{tour.periods.reduce((s, p) => s + p.capacity, 0)}
              </span>
              {tour.total_departures > 0 && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {tour.total_departures} รอบ
                </span>
              )}
            </div>
          </div>

          {/* ---- Detail Tabs ---- */}
          <div className="border-t border-gray-200">
            {/* Tab Navigation */}
            <div className="flex gap-0 overflow-x-auto border-b border-gray-200 px-4 sm:px-5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === 'detail' ? 'รายละเอียด' : tab.id === 'periods' ? 'เดินทาง' : tab.id === 'itinerary' ? 'โปรแกรม' : 'เงื่อนไข'}
                  </span>
                  {tab.count && tab.count > 0 && (
                    <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">

              {/* ---- Detail Tab ---- */}
              {activeTab === 'detail' && (
                <div className="space-y-6">
                  {tour.description && (
                    <div>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{tour.description}</p>
                    </div>
                  )}

                  {/* Highlights */}
                  {tour.highlights && tour.highlights.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        ไฮไลท์ทัวร์
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tour.highlights.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shopping & Food */}
                  {((tour.shopping_highlights && tour.shopping_highlights.length > 0) || (tour.food_highlights && tour.food_highlights.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {tour.shopping_highlights && tour.shopping_highlights.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-pink-500" />
                            ช้อปปิ้ง
                          </h4>
                          <div className="space-y-2">
                            {tour.shopping_highlights.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <Check className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {tour.food_highlights && tour.food_highlights.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                            อาหาร
                          </h4>
                          <div className="space-y-2">
                            {tour.food_highlights.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special Highlights */}
                  {tour.special_highlights && tour.special_highlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-red-500" />
                        ไฮไลท์พิเศษ
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tour.special_highlights.map((item, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-sm font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transports */}
                  {tour.transports.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-blue-500" />
                        สายการบิน
                      </h4>
                      <TransportSection transports={tour.transports} />
                    </div>
                  )}

                  {/* Tags */}
                  {((tour.themes && tour.themes.length > 0) || (tour.suitable_for && tour.suitable_for.length > 0)) && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {tour.themes?.map(t => (
                          <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                            {THEME_LABELS[t] || t}
                          </span>
                        ))}
                        {tour.suitable_for?.map(s => (
                          <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                            <Users className="w-3 h-3 inline mr-0.5" />{SUITABLE_LABELS[s] || s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cities */}
                  {tour.cities.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
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

                  {/* Hashtags */}
                  {tour.hashtags && tour.hashtags.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {tour.hashtags.map((tag, idx) => (
                          <span key={idx} className="text-orange-500 text-sm font-medium">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Periods Tab ---- */}
              {activeTab === 'periods' && (
                <PeriodTable periods={tour.periods} />
              )}

              {/* ---- Itinerary Tab ---- */}
              {activeTab === 'itinerary' && (
                tour.itineraries.length > 0 ? (
                  <ItinerarySection itineraries={tour.itineraries} />
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีโปรแกรมทัวร์รายวัน</p>
                  </div>
                )
              )}

              {/* ---- Conditions Tab ---- */}
              {activeTab === 'conditions' && (
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
                  {!tour.inclusions && !tour.exclusions && !tour.conditions && (
                    <div className="text-center py-8 text-gray-400">
                      <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>ยังไม่มีเงื่อนไข</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
