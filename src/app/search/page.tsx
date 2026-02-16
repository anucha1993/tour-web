'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft, MapPin, Calendar, Star, Loader2 } from 'lucide-react';
import { searchApi } from '@/lib/api';
import SearchForm from '@/components/shared/SearchForm';
import TourTabBadges from '@/components/shared/TourTabBadges';

interface SearchTour {
  id: number;
  title: string;
  slug: string;
  tour_code: string;
  cover_image_url: string | null;
  duration_days: number;
  duration_nights: number;
  min_price: number | null;
  display_price: number | null;
  badge: string | null;
  hotel_star: number | null;
  country: { name_th: string; iso2: string } | null;
  cities: string[];
  next_periods: {
    start_date: string;
    end_date: string;
    available: number;
    price: number | null;
  }[];
}

const formatPrice = (price: number | null | undefined) => {
  if (!price) return null;
  return new Intl.NumberFormat('th-TH').format(price);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${date.getDate()} ${thMonths[date.getMonth()]} ${(date.getFullYear() + 543).toString().slice(-2)}`;
};

const BADGE_COLORS: Record<string, string> = {
  HOT: 'bg-red-500',
  NEW: 'bg-blue-500',
  BEST_SELLER: 'bg-orange-500',
  PROMOTION: 'bg-green-500',
  LIMITED: 'bg-purple-500',
};

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [tours, setTours] = useState<SearchTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const currentQuery = q;

  useEffect(() => {
    if (!q || q.length < 2) {
      const timer = setTimeout(() => {
        setTours([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
    setLoading(true);
    searchApi.search(q, 1).then((res) => {
      if (res?.data) {
        setTours(res.data as SearchTour[]);
        setMeta(res.meta);
      }
    }).catch(() => {
      setTours([]);
    }).finally(() => setLoading(false));
  }, [q]);

  const loadMore = async () => {
    if (meta.current_page >= meta.last_page) return;
    const nextPage = meta.current_page + 1;
    const res = await searchApi.search(currentQuery, nextPage);
    if (res?.data) {
      setTours((prev) => [...prev, ...(res.data as SearchTour[])]);
      setMeta(res.meta);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search Form */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container-custom pt-6 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Search className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">ค้นหาทัวร์</h1>
          </div>

          <SearchForm initialKeyword={q} variant="page" />

          {/* Result count */}
          {currentQuery && !loading && (
            <p className="text-gray-500 text-sm mt-4">
              ผลการค้นหา &ldquo;<span className="font-semibold text-gray-700">{currentQuery}</span>&rdquo; — พบ {meta.total} รายการ
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container-custom py-6">
        {loading && tours.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="flex flex-col sm:flex-row">
                  {/* Image skeleton */}
                  <div className="w-full sm:w-48 aspect-square flex-shrink-0 bg-gray-200" />
                  {/* Content skeleton */}
                  <div className="flex-1 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 bg-gray-200 rounded w-20" />
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-5 bg-gray-100 rounded w-16" />
                      <div className="h-5 bg-gray-100 rounded w-16" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                      <div className="h-4 bg-gray-100 rounded w-20" />
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </div>
                  </div>
                  {/* Price skeleton */}
                  <div className="hidden sm:flex flex-col items-end justify-start p-5 gap-1">
                    <div className="h-3 bg-gray-100 rounded w-12" />
                    <div className="h-7 bg-orange-100 rounded w-24" />
                  </div>
                </div>
                {/* Share bar skeleton */}
                <div className="flex items-center gap-1 justify-end px-4 py-2 border-t border-gray-50">
                  <div className="h-4 bg-gray-100 rounded w-8" />
                  <div className="w-7 h-7 bg-gray-100 rounded-full" />
                  <div className="w-7 h-7 bg-gray-100 rounded-full" />
                  <div className="w-7 h-7 bg-gray-100 rounded-full" />
                  <div className="w-7 h-7 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบผลลัพธ์</h3>
            <p className="text-gray-500 mb-4">ลองค้นหาด้วยคำอื่น เช่น ชื่อประเทศ เมือง หรือรหัสทัวร์</p>
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
              กลับหน้าแรก
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                <Link
                  href={`/tours/${tour.slug}`}
                  className="group block"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-48 aspect-square flex-shrink-0">
                      {tour.cover_image_url ? (
                        <Image
                          src={tour.cover_image_url}
                          alt={tour.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 256px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[120px]">
                          <MapPin className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      {tour.badge && (
                        <span className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-bold text-white rounded ${BADGE_COLORS[tour.badge] || 'bg-gray-500'}`}>
                          {tour.badge.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{tour.tour_code}</span>
                            <span className="text-xs text-gray-400">{tour.duration_days} วัน {tour.duration_nights} คืน</span>
                            {tour.hotel_star && (
                              <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                {tour.hotel_star}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 text-sm sm:text-base">
                            {tour.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {tour.country && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <img src={`https://flagcdn.com/16x12/${tour.country.iso2}.png`} alt="" className="w-4 h-3 rounded-[1px]" />
                                {tour.country.name_th}
                              </span>
                            )}
                            {tour.cities.length > 0 && (
                              <span className="text-xs text-gray-400">
                                {tour.cities.slice(0, 3).join(', ')}
                                {tour.cities.length > 3 && ` +${tour.cities.length - 3}`}
                              </span>
                            )}
                          </div>
                          {/* Promotion Badges */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <TourTabBadges tourId={tour.id} className="text-xs px-2 py-0.5" />
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-400">เริ่มต้น</div>
                          <div className="text-xl font-bold text-orange-600">
                            {formatPrice(tour.min_price) || '-'}
                          </div>
                        </div>
                      </div>

                      {/* Next departures */}
                      {tour.next_periods.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {tour.next_periods.map((p, i) => (
                            <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                              {formatDate(p.start_date)}
                              {p.available > 0 && <span className="text-green-600 ml-1">ว่าง {p.available}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Share buttons */}
                <div className="flex items-center gap-1 justify-end px-4 py-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400 mr-0.5">แชร์</span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tours/${tour.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="แชร์ Facebook"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                  </a>
                  <a
                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tours/${tour.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                    title="แชร์ LINE"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tours/${tour.slug}`)}&text=${encodeURIComponent(tour.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                    title="แชร์ X"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = `${window.location.origin}/tours/${tour.slug}`;
                      navigator.clipboard.writeText(url);
                      const btn = e.currentTarget;
                      btn.title = 'คัดลอกแล้ว!';
                      setTimeout(() => { btn.title = 'คัดลอกลิงก์'; }, 2000);
                    }}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                    title="คัดลอกลิงก์"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  </button>
                </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {meta.current_page < meta.last_page && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-700 rounded-xl font-medium transition-colors"
                >
                  โหลดเพิ่มเติม
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
