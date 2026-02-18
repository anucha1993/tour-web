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
  ImageIcon, Play, Video,
} from 'lucide-react';
import {
  tourDetailApi,
  reviewApi,
  TourDetail,
  TourDetailPeriod,
  TourDetailItinerary,
  TourDetailVideo,
  ReviewSummary,
} from '@/lib/api';
import FavoriteButton from '@/components/home/FavoriteButton';
import BookingModal from '@/components/tours/BookingModal';
import TourTabBadges from '@/components/shared/TourTabBadges';
import ReviewSection from '@/components/tours/ReviewSection';
import RelatedToursCarousel from '@/components/tours/RelatedToursCarousel';

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
const THUMBNAIL_SLOTS = 5; // Always show 6 thumbnail slots including main image

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
      <div className="flex bg-gray-100 overflow-hidden rounded-2xl">
        {/* Thumbnails - left side (always show 6 slots) */}
        <div className="hidden sm:flex flex-col gap-0.5 p-1 bg-gray-50 w-[130px] flex-shrink-0">
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
                width={200}
                height={200}
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
          className="relative flex-1 min-h-[350px] sm:min-h-[450px] lg:min-h-[520px] cursor-pointer bg-white "
          onClick={() => allImages.length > 0 && setLightbox(true)}
        >
          {allImages.length > 0 ? (
            <Image
              src={allImages[current].url}
              alt={allImages[current].alt || title}
              fill
              className="object-contain "
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

// ===== Video Review Section =====
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function VideoReviewSection({ videos }: { videos: TourDetailVideo[] }) {
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <div className="pt-6 border-t border-gray-100">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
        <Video className="w-5 h-5 text-orange-500" />
        วิดีโอรีวิว
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const embedUrl = getEmbedUrl(video.video_url);
          const ytId = getYouTubeId(video.video_url);
          const thumbnail = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
          const isPlaying = playingId === video.id;

          return (
            <div key={video.id} className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gray-900">
                {isPlaying && embedUrl ? (
                  <iframe
                    src={`${embedUrl}?autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    onClick={() => embedUrl ? setPlayingId(video.id) : window.open(video.video_url, '_blank')}
                    className="relative w-full h-full group cursor-pointer"
                  >
                    {thumbnail ? (
                      <Image src={thumbnail} alt={video.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <Video className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-orange-500 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
              {video.title && (
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.title}</p>
                  {video.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{video.description}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Period / Price Table =====
function PeriodTable({ periods, onBookPeriod }: { periods: TourDetailPeriod[]; onBookPeriod?: (period: TourDetailPeriod) => void }) {
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
    sold_out: 'Sold Out',
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
            
              <th className="text-center px-4 py-3 font-semibold rounded-tr-lg w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {display.map((period) => {
              const offer = period.offer;
              const startD = new Date(period.start_date);
              const endD = new Date(period.end_date);
              // Compute effective status: if available = 0, treat as sold_out
              const effectiveStatus = period.available === 0 ? 'sold_out' : period.sale_status;
              return (
                <tr key={period.id} className={`transition-colors ${effectiveStatus === 'sold_out' ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-3">
                    <div className={`font-medium ${effectiveStatus === 'sold_out' ? 'text-gray-500' : 'text-gray-800'}`}>
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
                    ) : <span className="text-xs text-orange-500">ติดต่อฝ่ายขาย</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {offer?.price_child ? (
                      <span className="text-gray-700">฿{(offer.price_child - offer.discount_child_bed).toLocaleString()}</span>
                    ) : <span className="text-xs text-orange-500">ติดต่อฝ่ายขาย</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {offer?.price_single ? (
                      <span className="text-gray-700">+฿{(offer.price_single - offer.discount_single).toLocaleString()}</span>
                    ) : <span className="text-xs text-orange-500">ติดต่อฝ่ายขาย</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-gray-600">{period.available}/{period.capacity}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[effectiveStatus] || 'text-gray-600 bg-gray-50'}`}>
                      {statusLabels[effectiveStatus] || effectiveStatus}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    {effectiveStatus !== 'sold_out' && onBookPeriod && (
                      <button
                        onClick={() => onBookPeriod(period)}
                        className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition cursor-pointer"
                      >
                        จอง
                      </button>
                    )}
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
          // Compute effective status: if available = 0, treat as sold_out
          const effectiveStatus = period.available === 0 ? 'sold_out' : period.sale_status;
          return (
            <div key={period.id} className={`relative border rounded-xl p-4 transition-colors overflow-hidden ${effectiveStatus === 'sold_out' ? 'border-gray-200 bg-gray-50' : 'border-gray-100 hover:border-orange-200'}`}>
              {/* Sold Out Stamp */}
              {effectiveStatus === 'sold_out' && (
                <div className="absolute -right-8 top-3 rotate-45 bg-red-500 text-white text-xs font-bold px-10 py-1 shadow-md">
                  SOLD OUT
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  {startD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {endD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[effectiveStatus] || ''}`}>
                  {statusLabels[effectiveStatus] || effectiveStatus}
                </span>
              </div>
              {offer ? (
                <div className="flex items-end justify-between">
                  <div>
                    {offer.discount_adult > 0 && (
                      <span className="text-xs text-gray-400 line-through mr-2">฿{offer.price_adult.toLocaleString()}</span>
                    )}
                    <span className={`text-lg font-bold ${offer.discount_adult > 0 ? 'text-red-500' : 'text-orange-500'}`}>
                      ฿{offer.net_price_adult.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">ว่าง {period.available} ที่</span>
                    {effectiveStatus !== 'sold_out' && onBookPeriod && (
                      <button
                        onClick={() => onBookPeriod(period)}
                        className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition cursor-pointer"
                      >
                        จอง
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-500">ติดต่อฝ่ายขาย</span>
                  {effectiveStatus !== 'sold_out' && onBookPeriod && (
                    <button
                      onClick={() => onBookPeriod(period)}
                      className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition cursor-pointer"
                    >
                      จอง
                    </button>
                  )}
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

// ===== Itinerary Component (Table) =====
function ItinerarySection({ itineraries }: { itineraries: TourDetailItinerary[] }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (itineraries.length === 0) return null;

  const selected = itineraries.find(d => d.day_number === selectedDay);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-orange-500" />
        <h3 className="text-base font-bold text-gray-800">แผนการเดินทาง {itineraries.length} วัน</h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-center px-3 py-3 font-semibold rounded-tl-lg w-16">วัน</th>
              <th className="text-left px-3 py-3 font-semibold">กิจกรรม</th>
              <th className="text-left px-3 py-3 font-semibold w-48">สถานที่</th>
              <th className="text-center px-3 py-3 font-semibold w-12" title="เช้า"><Coffee className="w-4 h-4 mx-auto text-gray-500" /></th>
              <th className="text-center px-3 py-3 font-semibold w-12" title="กลางวัน"><Sun className="w-4 h-4 mx-auto text-gray-500" /></th>
              <th className="text-center px-3 py-3 font-semibold w-12" title="เย็น"><Moon className="w-4 h-4 mx-auto text-gray-500" /></th>
              <th className="text-left px-3 py-3 font-semibold rounded-tr-lg w-44">ที่พัก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {itineraries.map((day) => (
              <tr
                key={day.day_number}
                onClick={() => setSelectedDay(selectedDay === day.day_number ? null : day.day_number)}
                className="hover:bg-orange-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-lg text-sm font-bold">
                    {day.day_number}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">{day.title}</div>
                  {day.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{day.description}</p>
                  )}
                </td>
                <td className="px-3 py-3">
                  {day.places && day.places.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {day.places.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">{p}</span>
                      ))}
                      {day.places.length > 2 && (
                        <span className="text-xs text-gray-400">+{day.places.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {day.has_breakfast
                    ? <Check className="w-4 h-4 text-green-500 mx-auto" />
                    : <Minus className="w-4 h-4 text-gray-200 mx-auto" />
                  }
                </td>
                <td className="px-3 py-3 text-center">
                  {day.has_lunch
                    ? <Check className="w-4 h-4 text-green-500 mx-auto" />
                    : <Minus className="w-4 h-4 text-gray-200 mx-auto" />
                  }
                </td>
                <td className="px-3 py-3 text-center">
                  {day.has_dinner
                    ? <Check className="w-4 h-4 text-green-500 mx-auto" />
                    : <Minus className="w-4 h-4 text-gray-200 mx-auto" />
                  }
                </td>
                <td className="px-3 py-3">
                  {day.accommodation ? (
                    <div className="flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">{day.accommodation}</span>
                      {day.hotel_star && (
                        <span className="flex items-center gap-0.5 ml-1">
                          {Array.from({ length: day.hotel_star }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {itineraries.map((day) => (
          <button
            key={day.day_number}
            onClick={() => setSelectedDay(selectedDay === day.day_number ? null : day.day_number)}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
              selectedDay === day.day_number ? 'border-orange-300 bg-orange-50/50' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                {day.day_number}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm truncate">{day.title}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span className="flex gap-0.5">
                    {day.has_breakfast && <Coffee className="w-3 h-3 text-green-500" />}
                    {day.has_lunch && <Sun className="w-3 h-3 text-green-500" />}
                    {day.has_dinner && <Moon className="w-3 h-3 text-green-500" />}
                  </span>
                  {day.places && day.places.length > 0 && (
                    <span className="truncate"><MapPin className="w-3 h-3 inline" /> {day.places[0]}{day.places.length > 1 ? ` +${day.places.length - 1}` : ''}</span>
                  )}
                </div>
              </div>
              {selectedDay === day.day_number ? <ChevronUp className="w-4 h-4 text-orange-400" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
            </div>
          </button>
        ))}
      </div>

      {/* Detail Panel (shown when row/card clicked) */}
      {selected && (
        <div className="mt-4 p-4 bg-white border border-orange-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">{selected.day_number}</span>
            <h4 className="font-bold text-gray-800">{selected.title}</h4>
          </div>

          {selected.description && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-4">{selected.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {/* Meals */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 font-medium mb-1.5">อาหาร</div>
              <div className="flex gap-3">
                <span className={`flex items-center gap-1 text-xs font-medium ${selected.has_breakfast ? 'text-green-600' : 'text-gray-300'}`}>
                  <Coffee className="w-3.5 h-3.5" /> เช้า
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium ${selected.has_lunch ? 'text-green-600' : 'text-gray-300'}`}>
                  <Sun className="w-3.5 h-3.5" /> เที่ยง
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium ${selected.has_dinner ? 'text-green-600' : 'text-gray-300'}`}>
                  <Moon className="w-3.5 h-3.5" /> เย็น
                </span>
              </div>
              {selected.meals_note && <div className="text-xs text-gray-400 mt-1">{selected.meals_note}</div>}
            </div>

            {/* Accommodation */}
            {selected.accommodation && (
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1.5">ที่พัก</div>
                <div className="flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-gray-800">{selected.accommodation}</span>
                </div>
                {selected.hotel_star && (
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: selected.hotel_star }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Places */}
            {selected.places && selected.places.length > 0 && (
              <div className="p-3 bg-orange-50/50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1.5">สถานที่เที่ยว</div>
                <div className="flex flex-wrap gap-1">
                  {selected.places.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-xs bg-white text-orange-700 px-2 py-1 rounded font-medium">
                      <MapPin className="w-3 h-3 text-orange-400" />{p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          {selected.images && selected.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selected.images.map((img, i) => (
                <div key={i} className="relative w-36 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={img} alt={`Day ${selected.day_number} - ${i + 1}`} fill className="object-cover" sizes="144px" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary bar */}
      <div className="mt-4 p-3 bg-orange-50 rounded-xl flex flex-wrap items-center gap-4 text-xs text-orange-700">
        <span className="font-semibold">สรุป {itineraries.length} วัน:</span>
        <span>🍽️ รวม {itineraries.reduce((s, d) => s + (d.has_breakfast ? 1 : 0) + (d.has_lunch ? 1 : 0) + (d.has_dinner ? 1 : 0), 0)} มื้อ</span>
        <span>🏨 {itineraries.filter(d => d.accommodation).length} คืน</span>
        <span>📍 {itineraries.reduce((s, d) => s + (d.places?.length || 0), 0)} สถานที่</span>
      </div>
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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPeriod, setBookingPeriod] = useState<TourDetailPeriod | null>(null);
  const [highlightSlideIndex, setHighlightSlideIndex] = useState(0);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const viewRecorded = useRef(false);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  // Fetch tour data
  useEffect(() => {
    if (!slug || slug === 'null' || slug === 'undefined') {
      setError('ไม่พบทัวร์ที่ต้องการ');
      setLoading(false);
      return;
    }
    setLoading(true);
    setHighlightSlideIndex(0); // Reset slider when loading new tour
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

  // Fetch review summary
  useEffect(() => {
    if (!slug || slug === 'null' || slug === 'undefined') return;
    reviewApi.getSummary(slug).then(res => {
      if (res.success && res.data) {
        setReviewSummary(res.data.summary);
      }
    }).catch(() => { /* ignore */ });
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

  // Check if all periods are sold out (available = 0 or sale_status = 'sold_out')
  const isAllSoldOut = tour.periods.length === 0 || tour.periods.every(p => p.available === 0 || p.sale_status === 'sold_out');

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
              <span className="flex items-center gap-1">
                {tour.primary_country.iso2 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://flagcdn.com/w20/${tour.primary_country.iso2.toLowerCase()}.png`} alt={tour.primary_country.name} className="w-5 h-3.5 object-cover rounded-sm" />
                )}
                {tour.primary_country.name}
              </span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{tour.title}</span>
        </nav>

        {/* ===== Viator-Style Main Card ===== */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* ---- Title Section ---- */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{tour.tour_code}</span>
              {badgeInfo && <Badge color={badgeInfo.color}>{badgeInfo.text}</Badge>}
              {discountPercent > 0 && <Badge color="red">ลด {discountPercent}%</Badge>}
              <TourTabBadges tourId={tour.id} />
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

              {reviewSummary && reviewSummary.total_reviews > 0 && (
                <>
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  <button
                    onClick={() => {
                      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= Math.round(reviewSummary.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{reviewSummary.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500">({reviewSummary.total_reviews} รีวิว)</span>
                  </button>
                </>
              )}

              <span className="text-gray-300 hidden sm:inline">|</span>

              <span className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {tour.countries.map((c, i) => (
                  <span key={c.id} className="inline-flex items-center gap-1">
                   
                    {c.name}{i < tour.countries.length - 1 ? ',' : ''}
                  </span>
                ))}
                {tour.countries.length === 0 && 'ประเทศ'}
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


            </div>
          </div>

          {/* ---- Gallery + Price Panel ---- */}
          <div className="flex flex-col lg:flex-row">
            {/* Gallery - Square image with thumbnails */}
            <div className="lg:w-[65%] lg:flex-shrink-0 relative overflow-hidden">
              {/* SOLD OUT Stamp on Gallery */}
              {isAllSoldOut && (
                <div className="absolute -right-16 top-8 rotate-45 bg-red-500 text-white text-lg font-bold px-20 py-2.5 shadow-lg z-20">
                  SOLD OUT
                </div>
              )}
              <ViatorGallery
                images={tour.gallery}
                galleryImages={tour.gallery_images || []}
                coverUrl={tour.cover_image_url}
                coverAlt={tour.cover_image_alt}
                title={tour.title}
              />
            </div>

            {/* Price & Booking Panel */}
            <div className="flex-1 p-4 sm:p-5 relative overflow-hidden">
              {/* SOLD OUT Stamp */}
              {isAllSoldOut && (
                <div className="absolute -right-12 top-6 rotate-45 bg-red-500 text-white text-sm font-bold px-14 py-2 shadow-lg z-10">
                  SOLD OUT
                </div>
              )}
              
              {/* Promo badge */}
              {discountPercent > 0 && !isAllSoldOut && (
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
                {isAllSoldOut ? (
                  <div className="block w-full text-center py-3 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed">
                    ที่นั่งเต็มแล้ว
                  </div>
                ) : (
                  <button
                    onClick={() => { setBookingPeriod(null); setBookingOpen(true); }}
                    className="block w-full text-center py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
                  >
                    จองทัวร์นี้
                  </button>
                )}
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

              {/* Conditions / Benefits */}
              {(tour.inclusions || tour.conditions) ? (
                <div className="space-y-2 text-sm">
                  {tour.inclusions && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        รวมในราคาทัวร์
                      </h4>
                      <div className="text-xs text-gray-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                        {tour.inclusions}
                      </div>
                    </div>
                  )}
                  {tour.conditions && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 mt-2">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        เงื่อนไข
                      </h4>
                      <div className="text-xs text-gray-600 leading-relaxed line-clamp-3 whitespace-pre-line">
                        {tour.conditions}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab('conditions')}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                  >
                    ดูเงื่อนไขทั้งหมด →
                  </button>
                </div>
              ) : (
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
              )}

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

              {/* Review Summary Widget */}
              <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    {reviewSummary && reviewSummary.total_reviews > 0 ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-bold text-gray-900">{reviewSummary.average_rating.toFixed(1)}</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i <= Math.round(reviewSummary.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">จาก {reviewSummary.total_reviews} รีวิว</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-sm text-gray-700">ยังไม่มีรีวิว</p>
                        <p className="text-xs text-gray-500">เป็นคนแรกที่รีวิวทัวร์นี้!</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {reviewSummary && reviewSummary.total_reviews > 0 && (
                    <button
                      onClick={() => {
                        reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="flex-1 text-sm text-orange-600 font-medium bg-white hover:bg-orange-50 border border-orange-200 rounded-lg py-2 px-3 transition cursor-pointer text-center"
                    >
                      อ่านรีวิว
                    </button>
                  )}
                  <button
                    onClick={() => {
                      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="flex-1 text-sm text-white font-medium bg-orange-500 hover:bg-orange-600 rounded-lg py-2 px-3 transition cursor-pointer text-center"
                  >
                    ✍️ เขียนรีวิว
                  </button>
                </div>
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

          {/* ---- Highlights Slider ---- */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <h4 className="text-sm font-semibold text-gray-800">ไฮไลท์ทัวร์</h4>
              </div>
              <div className="relative">
                {/* Left Arrow */}
                {highlightSlideIndex > 0 && (
                  <button
                    onClick={() => setHighlightSlideIndex(prev => Math.max(0, prev - 1))}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 cursor-pointer transition"
                    aria-label="Previous highlight"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                
                {/* Highlights Container */}
                <div className="overflow-hidden">
                  <div
                    className="flex gap-2 transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${highlightSlideIndex * 120}px)` }}
                  >
                    {tour.highlights.map((item, idx) => (
                      <span key={idx} className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-3 py-2 rounded-full font-medium whitespace-nowrap">
                        <Check className="w-3.5 h-3.5 text-orange-500" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Right Arrow */}
                {tour.highlights.length > 3 && highlightSlideIndex < tour.highlights.length - 3 && (
                  <button
                    onClick={() => setHighlightSlideIndex(prev => Math.min(tour.highlights!.length - 3, prev + 1))}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 cursor-pointer transition"
                    aria-label="Next highlight"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          )}

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
                <PeriodTable periods={tour.periods} onBookPeriod={(period) => { setBookingPeriod(period); setBookingOpen(true); }} />
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

      {/* ===== Video Reviews Section (outside card) ===== */}
      {tour.gallery_videos && tour.gallery_videos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <VideoReviewSection videos={tour.gallery_videos} />
          </div>
        </div>
      )}

      {/* ===== Customer Reviews Section (outside card) ===== */}
      <div ref={reviewSectionRef} className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <ReviewSection tourSlug={tour.slug} />
        </div>
      </div>

      {/* ===== Related Tours Carousel ===== */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-8">
        <RelatedToursCarousel tourSlug={tour.slug} />
      </div>

      {/* Booking Modal */}
      {tour && (
        <BookingModal
          tour={tour}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
          selectedPeriod={bookingPeriod}
        />
      )}
    </div>
  );
}
