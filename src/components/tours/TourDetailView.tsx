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
  ImageIcon, Play, Video, BookOpen, ArrowRight,
} from 'lucide-react';
import {
  tourDetailApi,
  reviewApi,
  blogApi,
  bookingApi,
  TourDetail,
  TourDetailPeriod,
  TourDetailItinerary,
  TourDetailVideo,
  ReviewSummary,
  BlogPost,
} from '@/lib/api';
import FavoriteButton from '@/components/home/FavoriteButton';
import BookingModal from '@/components/tours/BookingModal';
import TourTabBadges from '@/components/shared/TourTabBadges';
import CopyTourTextButton from '@/components/shared/CopyTourTextButton';
import ReviewSection from '@/components/tours/ReviewSection';
import RelatedToursCarousel from '@/components/tours/RelatedToursCarousel';
import ToursCountrySidebar from '@/components/tours/ToursCountrySidebar';
import CustomerReviews from '@/components/home/CustomerReviews';
import { useTourBadges } from '@/contexts/TourBadgesContext';
import { config } from '@/lib/config';
import { trackViewContent } from '@/lib/analytics';
import { displayTourCode } from '@/lib/tour-code';

// ===== Related Blog Posts Component =====
function RelatedBlogPosts({ cities, countryName }: {
  cities: { id: number; name: string; name_en: string; country_id: number }[];
  countryName: string;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (cities.length === 0) return;
    // Try cities in order until we get posts
    const tryNext = (idx: number) => {
      if (idx >= cities.length) { setLoaded(true); return; }
      const city = cities[idx];
      blogApi.getPosts({ city_id: city.id, per_page: 6 })
        .then(res => {
          const raw = res as unknown as { data: BlogPost[]; total: number };
          if (raw?.data && raw.data.length > 0) {
            setPosts(raw.data);
            setCityName(city.name);
            setLoaded(true);
          } else {
            tryNext(idx + 1);
          }
        })
        .catch(() => tryNext(idx + 1));
    };
    tryNext(0);
  }, [cities]);

  if (!loaded || posts.length === 0) return null;

  const label = cityName || countryName;

  const formatDate = (d: string | null) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">บทความน่าอ่านเกี่ยวกับ {label}</h2>
          </div>
          <Link
            href={`/blog?city=${cityName}`}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="flex flex-col h-full rounded-xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-md transition-all duration-300">
                {/* Cover */}
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                      <BookOpen className="w-10 h-10 text-orange-300" />
                    </div>
                  )}
                  {post.is_featured && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      แนะนำ
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="flex flex-col flex-1 p-3">
                  {post.category && (
                    <span className="text-xs text-orange-600 font-medium mb-1">{post.category.name}</span>
                  )}
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.published_at)}
                    </span>
                    {post.reading_time_min && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.reading_time_min} นาที
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.view_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

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

const formatPeriodPrice = (price: number | null | undefined) => {
  if (!price) return null;
  return new Intl.NumberFormat('th-TH').format(price);
};

const formatPeriodDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = thMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month}${String(year).slice(-2)}`;
};

const formatPeriodDateRange = (start: string, end: string) => `${formatPeriodDate(start)} - ${formatPeriodDate(end)}`;

const getPeriodDayOfWeek = (dateStr: string) => ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'][new Date(dateStr).getDay()];

const PERIOD_BADGE_BG_CLASSES: Record<string, string> = {
  red: 'bg-gradient-to-r from-red-600 to-orange-500',
  orange: 'bg-gradient-to-r from-orange-500 to-yellow-400',
  yellow: 'bg-gradient-to-r from-amber-400 to-yellow-300 !text-yellow-900',
  green: 'bg-gradient-to-r from-green-500 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-400',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-400',
};

function PeriodAvailabilityBadge({ period }: { period: TourDetailPeriod }) {
  if (period.status !== 'open' || period.available <= 0) {
    return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-sm font-bold rounded">เต็ม</span>;
  }

  if (period.available <= 5) {
    return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded">{period.available}</span>;
  }

  return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-bold rounded">{period.available}</span>;
}

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
  // Aspect ratio of the currently shown main image (to size the frame exactly, no white bars)
  const [mainAspect, setMainAspect] = useState<number | null>(null);

  return (
    <>
      <div className="flex items-start bg-gray-100 overflow-hidden rounded-2xl">
        {/* Thumbnails - left side */}
        <div className="hidden sm:flex flex-col gap-0.5 p-1 bg-gray-50 w-[130px] flex-shrink-0 self-stretch">
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

        {/* Main Image - frame follows the image ratio so there are no white bars */}
        <div
          className="relative flex-1 cursor-pointer bg-white"
          style={mainAspect ? { aspectRatio: String(mainAspect) } : undefined}
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
              onLoadingComplete={(img) =>
                setMainAspect(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null)
              }
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
              <ImageIcon className="w-4 h-4 text-gray-500" />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => {
          const embedUrl = getEmbedUrl(video.video_url);
          const ytId = getYouTubeId(video.video_url);
          const thumbnail = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
          const isPlaying = playingId === video.id;
          const isPortrait = video.orientation === 'portrait';

          return (
            <div
              key={video.id}
              className={`rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${isPortrait ? 'max-w-[240px] mx-auto w-full' : ''}`}
            >
              <div
                className="relative bg-gray-900 overflow-hidden flex"
                style={{ aspectRatio: isPortrait ? '9 / 16' : '16 / 9' }}
              >
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
                    className="relative block w-full h-full group cursor-pointer"
                  >
                    {thumbnail ? (
                      <Image src={thumbnail} alt={video.title} fill className={isPortrait ? 'object-cover' : 'object-cover'} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <Video className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    {/* Shorts badge */}
                    {isPortrait && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white shadow z-10">
                        📱 Shorts
                      </span>
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

// ===== Past Group Tours Gallery (reuses home CustomerReviews carousel) =====
function PastGroupToursGallery() {
  return (
    <CustomerReviews
      title="ผลงานจัดกรุ๊ปทัวร์ที่ผ่านมา"
      subtitle="ภาพและรีวิวจริงจากลูกค้าที่ร่วมเดินทางกับเรา"
    />
  );
}

// ===== Period / Price Table =====
function PeriodTable({ periods, onBookPeriod, tourId }: { periods: TourDetailPeriod[]; onBookPeriod?: (period: TourDetailPeriod) => void; tourId: number }) {
  const [expanded, setExpanded] = useState(false);
  const display = expanded ? periods : periods.slice(0, 6);
  const { getPeriodBadges } = useTourBadges();

  const computeSaleStatus = (available: number) => {
    if (available === 0) return 'sold_out';
    if (available < 4) return 'available';
    return 'booking';
  };

  if (periods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>ไม่มีรอบเดินทางในขณะนี้</p>
      </div>
    );
  }

  // Check if offer promotion is currently active based on promo dates
  const isPromoActive = (offer: TourDetailPeriod['offer']) => {
    if (!offer?.promo_name) return false;
    const today = new Date().toISOString().split('T')[0];
    if (offer.promo_start_date && today < offer.promo_start_date) return false;
    if (offer.promo_end_date && today > offer.promo_end_date) return false;
    return true;
  };

  const formatPromoDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };
  

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="text-white font-semibold bg-orange-400">
              <th className="px-4 py-3 text-center font-medium rounded-tl-lg whitespace-nowrap">เดินทาง</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">ผู้ใหญ่</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">พักเดี่ยว</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">ที่นั่ง</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">จอง</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">รับได้</th>
              <th className="px-4 py-3 text-center font-medium rounded-tr-lg whitespace-nowrap">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {display.map((period) => {
              const offer = period.offer;
              const isClosed = period.status !== 'open' || period.available <= 0;
              const periodBadges = getPeriodBadges(tourId, offer?.discount_adult || 0, period.id);
              const hasPromo = isPromoActive(offer);
              return (
                <tr key={period.id} className={isClosed ? 'bg-gray-50 text-gray-500' : 'hover:bg-orange-50/40'}>
                  <td className="px-4 py-3 text-left">
                    <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap">
                      <span className={`font-medium ${isClosed ? '' : 'text-gray-600'}`}>
                        {formatPeriodDateRange(period.start_date, period.end_date)}
                      </span>
                      <span className="text-gray-500 text-xs">{getPeriodDayOfWeek(period.start_date)}</span>
                      {hasPromo && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
                          <Sparkles className="w-3 h-3" />
                          {offer!.promo_name}
                        </span>
                      )}
                      {periodBadges.map((badge, bi) => (
                        <span
                          key={bi}
                          className={`inline-flex items-center gap-0.5 text-xs font-bold text-white px-2 py-0.5 rounded-full ${PERIOD_BADGE_BG_CLASSES[badge.color] || 'bg-gray-500'} ${badge.color === 'yellow' ? 'text-yellow-900' : ''}`}
                        >
                          {badge.icon && <span>{badge.icon}</span>}
                          {badge.text}
                        </span>
                      ))}
                      {hasPromo && offer!.promo_end_date && (
                        <span className="text-xs text-red-500 font-medium">
                          โปรสิ้นสุด {formatPromoDate(offer!.promo_end_date)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {offer ? (
                      <div>
                        {offer.discount_adult > 0 && (
                          <div className="line-through text-gray-500 text-sm">{formatPeriodPrice(offer.price_adult)}</div>
                        )}
                        <span className={`font-bold ${offer.discount_adult > 0 ? 'text-red-600' : isClosed ? '' : 'text-gray-600'}`}>
                          {formatPeriodPrice(offer.net_price_adult)}
                        </span>
                      </div>
                    ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {offer ? (
                      (offer.net_price_single ?? offer.price_single) ? (
                        <div>
                          {offer.discount_single > 0 && offer.price_single && (
                            <div className="line-through text-gray-500 text-sm">{formatPeriodPrice(offer.price_single)}</div>
                          )}
                          <span className={`font-bold ${offer.discount_single > 0 ? 'text-red-600' : isClosed ? '' : 'text-gray-600'}`}>
                            {formatPeriodPrice(offer.net_price_single ?? offer.price_single)}
                          </span>
                        </div>
                      ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>
                    ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>}
                  </td>
                  <td className="px-4 py-3">{period.capacity}</td>
                  <td className="px-4 py-3">{period.booked}</td>
                  <td className="px-4 py-3">
                    {!isClosed && onBookPeriod ? (
                      <button
                        type="button"
                        onClick={() => onBookPeriod(period)}
                        className="cursor-pointer transition-transform hover:scale-105"
                        aria-label={`จองรอบ ${formatPeriodDateRange(period.start_date, period.end_date)}`}
                      >
                        <PeriodAvailabilityBadge period={period} />
                      </button>
                    ) : (
                      <PeriodAvailabilityBadge period={period} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {onBookPeriod && (() => {
                      const saleStatus = computeSaleStatus(period.available);
                      if (isClosed) {
                        return <span className="px-3 py-1.5 bg-gray-300 text-gray-500 text-xs font-semibold rounded-lg">เต็ม</span>;
                      }
                      if (saleStatus === 'available') {
                        return (
                          <a
                            href={config.social.line}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            ไลน์
                          </a>
                        );
                      }
                      return (
                        <button
                          onClick={() => onBookPeriod(period)}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          จอง
                        </button>
                      );
                    })()}
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
          const isClosed = period.status !== 'open' || period.available <= 0;
          const periodBadges = getPeriodBadges(tourId, offer?.discount_adult || 0, period.id);
          const hasPromo = isPromoActive(offer);
          return (
            <div key={period.id} className={`relative border rounded-xl p-4 transition-colors overflow-hidden ${isClosed ? 'border-gray-200 bg-gray-50' : 'border-gray-100 hover:border-orange-200'}`}>
              {/* Sold Out Stamp */}
              {isClosed && (
                <div className="absolute -right-8 top-3 rotate-45 bg-red-500 text-white text-xs font-bold px-10 py-1 shadow-md">
                  เต็ม
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  {formatPeriodDateRange(period.start_date, period.end_date)}
                </span>
                {!isClosed && onBookPeriod ? (
                  <button
                    type="button"
                    onClick={() => onBookPeriod(period)}
                    className="cursor-pointer transition-transform hover:scale-105"
                    aria-label={`จองรอบ ${formatPeriodDateRange(period.start_date, period.end_date)}`}
                  >
                    <PeriodAvailabilityBadge period={period} />
                  </button>
                ) : (
                  <PeriodAvailabilityBadge period={period} />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-xs text-gray-500">{getPeriodDayOfWeek(period.start_date)}</span>
                {hasPromo && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
                    <Sparkles className="w-3 h-3" />
                    {offer!.promo_name}
                  </span>
                )}
                {periodBadges.map((badge, bi) => (
                  <span
                    key={bi}
                    className={`inline-flex items-center gap-0.5 text-xs font-bold text-white px-2 py-0.5 rounded-full ${PERIOD_BADGE_BG_CLASSES[badge.color] || 'bg-gray-500'} ${badge.color === 'yellow' ? 'text-yellow-900' : ''}`}
                  >
                    {badge.icon && <span>{badge.icon}</span>}
                    {badge.text}
                  </span>
                ))}
              </div>
              {offer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">ราคาผู้ใหญ่</div>
                      {offer.discount_adult > 0 && (
                        <div className="text-xs text-gray-500 line-through">{formatPeriodPrice(offer.price_adult)}</div>
                      )}
                      <div className={`font-bold ${offer.discount_adult > 0 ? 'text-red-600' : 'text-orange-500'}`}>
                        {formatPeriodPrice(offer.net_price_adult)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">พักเดี่ยว</div>
                      {(offer.net_price_single ?? offer.price_single) ? (
                        <>
                          {offer.discount_single > 0 && offer.price_single && (
                            <div className="text-xs text-gray-500 line-through">{formatPeriodPrice(offer.price_single)}</div>
                          )}
                          <div className={`font-bold ${offer.discount_single > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                            {formatPeriodPrice(offer.net_price_single ?? offer.price_single)}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-orange-500">ติดต่อฝ่ายขาย</div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-gray-50 py-2">
                      <div className="text-gray-500">ที่นั่ง</div>
                      <div className="font-semibold text-gray-800">{period.capacity}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 py-2">
                      <div className="text-gray-500">จอง</div>
                      <div className="font-semibold text-gray-800">{period.booked}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 py-2">
                      <div className="text-gray-500">รับได้</div>
                      <div className="font-semibold text-gray-800">{period.available}</div>
                    </div>
                  </div>
                  <div>
                    {hasPromo && offer.promo_end_date && (
                      <div className="text-xs text-red-500 font-medium mb-2">
                        โปรสิ้นสุด {formatPromoDate(offer.promo_end_date)}
                      </div>
                    )}
                    {onBookPeriod && (() => {
                      const saleStatus = computeSaleStatus(period.available);
                      if (isClosed) {
                        return (
                          <button disabled className="w-full px-3 py-2 bg-gray-300 text-gray-500 text-sm font-semibold rounded-lg cursor-not-allowed">
                            เต็ม
                          </button>
                        );
                      }
                      if (saleStatus === 'available') {
                        return (
                          <a
                            href={config.social.line}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                          >
                            ไลน์
                          </a>
                        );
                      }
                      return (
                        <button
                          onClick={() => onBookPeriod(period)}
                          className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                        >
                          จอง
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-500">ติดต่อฝ่ายขาย</span>
                  {onBookPeriod && (
                    <button
                      onClick={() => !isClosed && onBookPeriod(period)}
                      disabled={isClosed}
                      className={`px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition ${isClosed ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'}`}
                    >
                      {isClosed ? 'เต็ม' : 'จอง'}
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

// ===== Helper: ensure places is always string[] =====
function parsePlaces(places: unknown): string[] {
  if (Array.isArray(places)) return places;
  if (typeof places === 'string') {
    try { const parsed = JSON.parse(places); if (Array.isArray(parsed)) return parsed; } catch {}
    return places.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
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
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{day.description}</p>
                  )}
                </td>
                <td className="px-3 py-3">
                  {(() => { const places = parsePlaces(day.places); return places.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {places.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">{p}</span>
                      ))}
                      {places.length > 2 && (
                        <span className="text-xs text-gray-500">+{places.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  ); })()}
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
                    <span className="text-xs text-gray-500">-</span>
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
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span className="flex gap-0.5">
                    {day.has_breakfast && <Coffee className="w-3 h-3 text-green-500" />}
                    {day.has_lunch && <Sun className="w-3 h-3 text-green-500" />}
                    {day.has_dinner && <Moon className="w-3 h-3 text-green-500" />}
                  </span>
                  {(() => { const places = parsePlaces(day.places); return places.length > 0 && (
                    <span className="truncate"><MapPin className="w-3 h-3 inline" /> {places[0]}{places.length > 1 ? ` +${places.length - 1}` : ''}</span>
                  ); })()}
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
                <span className={`flex items-center gap-1 text-xs font-medium ${selected.has_breakfast ? 'text-green-600' : 'text-gray-500'}`}>
                  <Coffee className="w-3.5 h-3.5" /> เช้า
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium ${selected.has_lunch ? 'text-green-600' : 'text-gray-500'}`}>
                  <Sun className="w-3.5 h-3.5" /> เที่ยง
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium ${selected.has_dinner ? 'text-green-600' : 'text-gray-500'}`}>
                  <Moon className="w-3.5 h-3.5" /> เย็น
                </span>
              </div>
              {selected.meals_note && <div className="text-xs text-gray-500 mt-1">{selected.meals_note}</div>}
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
            {(() => { const places = parsePlaces(selected.places); return places.length > 0 && (
              <div className="p-3 bg-orange-50/50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1.5">สถานที่เที่ยว</div>
                <div className="flex flex-wrap gap-1">
                  {places.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-xs bg-white text-orange-700 px-2 py-1 rounded font-medium">
                      <MapPin className="w-3 h-3 text-orange-400" />{p}
                    </span>
                  ))}
                </div>
              </div>
            ); })()}
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
        <span>📍 {itineraries.reduce((s, d) => s + parsePlaces(d.places).length, 0)} สถานที่</span>
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
          {t.airline?.name && <span className="ml-2 text-gray-500">({t.airline.name})</span>}
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
// Rendered by the new /tour/[country]/[...rest] route (which resolves the slug
// from the catch-all segment and passes it as a prop) and the legacy
// /tours/[slug] fallback route (which exposes a `slug` route param).
export default function TourDetailView({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams();
  const slug = slugProp ?? (params.slug as string);

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('periods');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPeriod, setBookingPeriod] = useState<TourDetailPeriod | null>(null);
  const [highlightSlideIndex, setHighlightSlideIndex] = useState(0);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [selectedDisplayPeriod, setSelectedDisplayPeriod] = useState<TourDetailPeriod | null>(null);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const viewRecorded = useRef(false);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);
  const periodDropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch tour data
  useEffect(() => {
    if (!slug || slug === 'null' || slug === 'undefined') {
      setError('ไม่พบทัวร์ที่ต้องการ');
      setLoading(false);
      return;
    }
    setLoading(true);
    setHighlightSlideIndex(0); // Reset slider when loading new tour
    // Preload sales users for booking modal (will be cached)
    bookingApi.getSales().catch(() => {});
    tourDetailApi.get(slug).then(res => {
      if (res.success && res.data) {
        setTour(res.data);
        // Analytics: fire ViewContent for this tour program (gated by consent).
        trackViewContent({
          id: res.data.id,
          name: res.data.title,
          price: res.data.display_price ?? res.data.min_price ?? res.data.price_adult,
        });
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

  // Initialize selected display period to first available period
  useEffect(() => {
    if (!tour || tour.periods.length === 0) { setSelectedDisplayPeriod(null); return; }
    const first = tour.periods.find(p => p.available > 0 && p.status !== 'closed' && p.status !== 'cancelled') || tour.periods[0];
    setSelectedDisplayPeriod(first);
  }, [tour]);

  // Close period dropdown on outside click
  useEffect(() => {
    if (!periodDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [periodDropdownOpen]);

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

  // Compute sale_status locally from available seats (matches backend auto-calculation)
  const computeSaleStatus = (available: number) => {
    if (available === 0) return 'sold_out';
    if (available < 4) return 'available'; // ไลน์
    return 'booking'; // จอง
  };

  // Check if all periods are closed/full
  const isAllSoldOut = tour.periods.length === 0 || tour.periods.every(p =>
    p.available === 0 || p.status === 'closed' || p.status === 'cancelled'
  );

  const TABS: { id: DetailTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'periods', label: 'ช่วงเวลาการเดินทาง', icon: Calendar, count: tour.periods.length || undefined },
    { id: 'detail', label: 'รายละเอียดทัวร์', icon: FileText },
    { id: 'itinerary', label: 'โปรแกรมทัวร์', icon: MapPin, count: tour.itineraries.length || undefined },
    { id: 'conditions', label: 'เงื่อนไข', icon: Shield },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-16">
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

        {/* ===== Main content + Country Sidebar ===== */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
        {/* ===== Viator-Style Main Card ===== */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* ---- Title Section ---- */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{displayTourCode(tour.tour_code)}</span>
              {badgeInfo && <Badge color={badgeInfo.color}>{badgeInfo.text}</Badge>}
              {discountPercent > 0 && <Badge color="red">ลด {discountPercent}%</Badge>}
              {tour.discount_label && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">🏷️ {tour.discount_label}</span>
              )}
              <TourTabBadges tourId={tour.id} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-snug">
              {tour.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {(tour.hotel_star || tour.hotel_star_max) && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-gray-500" />
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

              {/* Review action buttons */}
              <div className="flex items-center gap-2">
                {reviewSummary && reviewSummary.total_reviews > 0 && (
                  <button
                    onClick={() => {
                      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="text-xs sm:text-sm text-orange-600 font-medium bg-white hover:bg-orange-50 border border-orange-200 rounded-lg py-1.5 px-3 transition cursor-pointer"
                  >
                    อ่านรีวิว
                  </button>
                )}
                <button
                  onClick={() => {
                    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-xs sm:text-sm text-white font-medium bg-orange-500 hover:bg-orange-600 rounded-lg py-1.5 px-3 transition cursor-pointer"
                >
                  ✍️ เขียนรีวิว
                </button>
                <CopyTourTextButton tour={tour} size="md" />
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
                  className="w-9 h-9 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-100 rounded-full transition cursor-pointer shadow-sm border border-gray-200"
                  aria-label="แชร์"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

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
                  <div className="text-sm text-gray-500">
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
                {/* Travel date selector */}
                <div className="relative flex-1" ref={periodDropdownRef}>
                  <button
                    onClick={() => tour.periods.length > 0 && setPeriodDropdownOpen(o => !o)}
                    className={`w-full p-2 rounded-lg text-left transition border ${
                      tour.periods.length > 0
                        ? 'border-orange-300 bg-orange-50/40 hover:border-orange-400 cursor-pointer'
                        : 'border-gray-200 cursor-default'
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                      <span>วันเดินทาง</span>
                      {tour.periods.length > 0 && (
                        <ChevronDown className={`w-3 h-3 text-orange-400 transition-transform ${periodDropdownOpen ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                    {selectedDisplayPeriod ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-800 flex-wrap">
                        <Plane className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        <span>{new Date(selectedDisplayPeriod.start_date + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                        <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span>{new Date(selectedDisplayPeriod.end_date + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">ไม่มีรอบเดินทาง</div>
                    )}
                  </button>
                  {/* Period dropdown list */}
                  {periodDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto">
                      {tour.periods.map(period => {
                        const isSoldOut = period.available === 0 || period.status === 'closed' || period.status === 'cancelled';
                        const isSelected = selectedDisplayPeriod?.id === period.id;
                        const sD = new Date(period.start_date + 'T00:00:00');
                        const eD = new Date(period.end_date + 'T00:00:00');
                        return (
                          <button
                            key={period.id}
                            onClick={() => { setSelectedDisplayPeriod(period); setPeriodDropdownOpen(false); }}
                            disabled={isSoldOut}
                            className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl ${
                              isSelected ? 'bg-orange-50 text-orange-700' :
                              isSoldOut ? 'opacity-40 cursor-not-allowed text-gray-500' :
                              'hover:bg-gray-50 text-gray-700 cursor-pointer'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-medium">
                                {sD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} → {eD.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </div>
                              <div className="text-xs text-gray-500">{isSoldOut ? 'เต็มแล้ว' : `ว่าง ${period.available} ที่`}</div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Available seats for selected period */}
                <div className="flex-1 p-2 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">ที่นั่งว่าง</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Users className={`w-4 h-4 ${selectedDisplayPeriod && selectedDisplayPeriod.available <= 5 && selectedDisplayPeriod.available > 0 ? 'text-red-400' : 'text-gray-500'}`} />
                    {selectedDisplayPeriod
                      ? <span className={selectedDisplayPeriod.available <= 5 && selectedDisplayPeriod.available > 0 ? 'text-red-500 font-bold' : ''}>
                          {selectedDisplayPeriod.available} ที่
                        </span>
                      : `${tour.available_seats} ที่`
                    }
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2 mb-4">
                {(() => {
                  const p = selectedDisplayPeriod;
                  const isClosed = !p
                    || p.available === 0
                    || p.status === 'closed'
                    || p.status === 'sold_out'
                    || p.status === 'cancelled';
                  const saleStatus = p ? computeSaleStatus(p.available) : 'sold_out';
                  if (isClosed) {
                    return (
                      <div className="block w-full text-center py-3 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed">
                        เต็ม
                      </div>
                    );
                  }
                  if (saleStatus === 'available') {
                    // ไลน์ — available < 4, show LINE contact button
                    return (
                      <a
                        href={config.social.line}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
                      >
                        จองด่วน
                      </a>
                    );
                  }
                  return (
                    <button
                      onClick={() => { setBookingPeriod(p); setBookingOpen(true); }}
                      className="block w-full text-center py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
                    >
                      จองเลย
                    </button>
                  );
                })()}
                {tour.pdf_url && (
                  <a
                    href={tour.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl transition shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    ดาวน์โหลด PDF
                  </a>
                )}

                {/* เงื่อนไขการจอง (ใต้ดาวน์โหลด) */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                    </span>
                    เงื่อนไขการจอง
                  </h4>
                  {tour.conditions ? (
                    <div className="text-xs text-gray-600 leading-relaxed line-clamp-5 whitespace-pre-line">
                      {tour.conditions}
                    </div>
                  ) : (
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>ยกเลิกได้ตามเงื่อนไข ล่วงหน้า 24 ชม.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>จองก่อน จ่ายทีหลัง พร้อมความยืดหยุ่น</span>
                      </li>
                    </ul>
                  )}
                  {nextDeparture && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-gray-700">จองล่วงหน้า! </span>
                        <span className="text-gray-500">เดินทาง {nextDeparture.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- รวมในราคาทัวร์ (full width) ---- */}
          <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-gray-200">
            <div className="bg-green-50/50 rounded-xl p-4 border border-green-100/80">
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                </span>
                รวมในราคาทัวร์
              </h4>
              {tour.inclusions ? (
                <div className="text-xs text-gray-600 leading-relaxed line-clamp-5 whitespace-pre-line">
                  {tour.inclusions}
                </div>
              ) : (
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    ตั๋วเครื่องบินไป-กลับ พร้อมที่พัก
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    อาหารตามรายการ พร้อมไกด์นำเที่ยว
                  </li>
                </ul>
              )}
              <button
                onClick={() => setActiveTab('conditions')}
                className="mt-3 text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer"
              >
                ดูเงื่อนไขทั้งหมด →
              </button>
            </div>
          </div>

          {/* ---- Bottom Features Row ---- */}
          <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-2 font-mono bg-gray-200 px-2 py-1 rounded text-xs">
                🏷️ {displayTourCode(tour.tour_code)}
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
                <PeriodTable periods={tour.periods} tourId={tour.id} onBookPeriod={(period) => { setBookingPeriod(period); setBookingOpen(true); }} />
              )}

              {/* ---- Itinerary Tab ---- */}
              {activeTab === 'itinerary' && (
                tour.itineraries.length > 0 ? (
                  <ItinerarySection itineraries={tour.itineraries} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
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
                    <div className="text-center py-8 text-gray-500">
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

          {/* ===== Country Sidebar (same country / city tours) ===== */}
          <ToursCountrySidebar
            countryId={tour.primary_country?.id ?? null}
            countryName={tour.primary_country?.name || ''}
            cityIds={tour.cities.map((c) => c.id)}
            currentTourId={tour.id}
          />
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

      {/* ===== Past Group Tours Gallery (same data as homepage reviews) ===== */}
      <PastGroupToursGallery />

      {/* ===== Customer Reviews Section (outside card) ===== */}
      <div ref={reviewSectionRef} className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <ReviewSection tourSlug={tour.slug} />
        </div>
      </div>

      {/* ===== Related Blog Posts ===== */}
      {tour.cities.length > 0 && (
        <RelatedBlogPosts
          cities={tour.cities}
          countryName={tour.primary_country?.name || ''}
        />
      )}

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

      {/* Mobile floating จองด่วน button */}
      {!isAllSoldOut && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">เริ่มต้น</div>
            <div className="text-lg font-bold text-orange-600">
              ฿{(selectedDisplayPeriod?.offer?.price_adult ?? tour.display_price ?? 0).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => {
              const period = selectedDisplayPeriod ?? tour.periods.find(p => p.available > 0 && p.status !== 'closed' && p.status !== 'cancelled');
              if (period) {
                const status = computeSaleStatus(period.available);
                if (status === 'available') {
                  // ไลน์ — redirect to LINE
                  window.open(config.social.line, '_blank');
                } else {
                  setBookingPeriod(period); setBookingOpen(true);
                }
              }
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md whitespace-nowrap"
          >
            <ShoppingBag className="w-5 h-5" />
            จองด่วน
          </button>
        </div>
      )}
    </div>
  );
}
