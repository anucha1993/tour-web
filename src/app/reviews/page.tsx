'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, StarHalf, MessageSquare, ImageIcon, Eye, ChevronLeft, ChevronRight,
  ArrowRight, ThumbsUp, ChevronDown, ChevronUp, X, Search,
} from 'lucide-react';
import { reviewApi, TourReview, ReviewSummary, ReviewPageSettings } from '@/lib/api';
import { API_URL } from '@/lib/config';

// ── Helpers ──

function resolveImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_URL.replace('/api', '') + url;
}

function computeAvgRating(review: TourReview): number {
  if (review.category_ratings && Object.keys(review.category_ratings).length > 0) {
    const vals = Object.values(review.category_ratings).map(Number);
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
  }
  return review.rating;
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(rating);
  const hasHalf = rating !== full;
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        if (s <= full) return <Star key={s} className={`${cls} fill-yellow-400 text-yellow-400`} />;
        if (s === full + 1 && hasHalf) return <StarHalf key={s} className={`${cls} fill-yellow-400 text-yellow-400`} />;
        return <Star key={s} className={`${cls} text-gray-200`} />;
      })}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── Sort Options ──

const SORT_OPTIONS = [
  { value: 'latest', label: 'ล่าสุด' },
  { value: 'highest', label: 'คะแนนสูงสุด' },
  { value: 'lowest', label: 'คะแนนต่ำสุด' },
  { value: 'helpful', label: 'มีประโยชน์ที่สุด' },
  { value: 'most_viewed', label: 'ยอดนิยม' },
];

// ── Review Card ──

function ReviewCard({ review }: { review: TourReview }) {
  const avgRating = computeAvgRating(review);
  const tourTitle = review.tour?.tour_name || review.tour?.title || '';
  const hasImages = review.images && review.images.length > 0;

  return (
    <Link
      href={`/reviews/${review.id}`}
      className="group"
    >
      <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        {hasImages && (
          <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(review.images![0].image_url)}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {review.images!.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {review.images!.length}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Rating + date */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1.5 text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {avgRating}
            </span>
            {review.created_at && (
              <span>{formatDate(review.created_at)}</span>
            )}
          </div>

          {/* Comment */}
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-3 flex-1">
            {review.comment}
          </p>

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {review.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-3 mt-auto">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {review.reviewer_avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(review.reviewer_avatar_url)}
                  alt={review.reviewer_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {review.reviewer_name?.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-800 truncate">
                  {review.reviewer_name}
                </div>
                {tourTitle && (
                  <div className="text-xs text-gray-400 truncate">ทัวร์: {tourTitle}</div>
                )}
              </div>
            </div>

            {/* Stats + read more */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {(review.views_count || 0).toLocaleString()}
                </span>
                {(review.helpful_count || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {review.helpful_count}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-orange-600 group-hover:underline flex items-center gap-1">
                อ่านเพิ่มเติม
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Skeleton ──

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2 mb-3 flex-1">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-4/5 bg-gray-100 rounded" />
          <div className="h-3 w-2/3 bg-gray-100 rounded" />
        </div>
        <div className="border-t border-gray-100 pt-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-2.5 w-32 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [pageSettings, setPageSettings] = useState<ReviewPageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    rating: true,
    sort: true,
  });

  // Fetch page settings on mount
  useEffect(() => {
    reviewApi.getPageSettings().then(res => {
      const data = (res as unknown as { data: ReviewPageSettings })?.data;
      if (data) setPageSettings(data);
    }).catch(() => {});
  }, []);

  const fetchReviews = async (pageNum: number, sortBy: string, rating: number | null) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: pageNum,
        per_page: 12,
        sort: sortBy,
      };
      if (rating) params.rating = rating;

      const res = await reviewApi.listAll(params);
      if (res.data) {
        const d = res.data;
        setReviews(d.reviews.data);
        setPage(d.reviews.current_page);
        setLastPage(d.reviews.last_page);
        setTotal(d.reviews.total);
        if (d.summary) setSummary(d.summary);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, sort, ratingFilter);
  }, [sort, ratingFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchReviews(newPage, sort, ratingFilter);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllFilters = () => {
    setRatingFilter(null);
    setSearchQuery('');
    setSearchInput('');
    setSort('latest');
    setPage(1);
  };

  const heroTitle = pageSettings?.hero_title || 'รีวิวจากลูกค้า';
  const heroSubtitle = pageSettings?.hero_subtitle || 'เสียงจากลูกค้าที่ไว้วางใจเดินทางกับเรา อ่านประสบการณ์จริงจากผู้เดินทาง';
  const heroImage = pageSettings?.hero_image_url;
  const heroImagePos = pageSettings?.hero_image_position || 'center';
  const isFiltered = !!(ratingFilter || searchQuery);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Hero Section ===== */}
      <section className="relative text-white py-16 md:py-20 overflow-hidden">
        {heroImage ? (
          <>
            <Image src={heroImage} alt="" fill className="object-cover" style={{ objectPosition: heroImagePos }} priority />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
        )}
        <div className="container-custom text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70">Customer Reviews</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{heroTitle}</h1>
          {heroSubtitle && (
            <p className="text-lg text-white/80 max-w-xl mx-auto">{heroSubtitle}</p>
          )}
          {/* Summary stats in hero */}
          {summary && (
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                <StarRating rating={summary.average_rating} />
                <span className="text-lg font-bold">{summary.average_rating}</span>
              </div>
              <div className="text-white/80 text-sm">
                จาก <span className="font-semibold text-white">{summary.total_reviews.toLocaleString()}</span> รีวิว
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Main Content: Sidebar + Reviews ===== */}
      <div className="container-custom py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ===== SIDEBAR ===== */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-[100px] space-y-5">

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">ค้นหา</h3>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหารีวิว..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>
              </div>

              {/* Active Filters Summary */}
              {isFiltered && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-orange-700">ตัวกรองที่ใช้</h3>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ratingFilter && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                        {ratingFilter} ดาว
                        <button onClick={() => { setRatingFilter(null); setPage(1); }}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                        &ldquo;{searchQuery}&rdquo;
                        <button onClick={() => { setSearchQuery(''); setSearchInput(''); setPage(1); }}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Rating Distribution */}
              {summary && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('rating')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-400" /> คะแนน
                    </h3>
                    {openSections.rating ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {openSections.rating && (
                    <div className="border-t border-gray-100 px-4 py-3">
                      {/* Overall */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-3xl font-bold text-gray-900">{summary.average_rating}</div>
                        <div>
                          <StarRating rating={summary.average_rating} />
                          <div className="text-xs text-gray-500 mt-0.5">{summary.total_reviews.toLocaleString()} รีวิว</div>
                        </div>
                      </div>
                      {/* Rating bars */}
                      <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = summary.rating_distribution?.[star] || 0;
                          const maxCount = Math.max(...Object.values(summary.rating_distribution || {}), 1);
                          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          const isActive = ratingFilter === star;
                          return (
                            <button
                              key={star}
                              onClick={() => {
                                setRatingFilter(isActive ? null : star);
                                setPage(1);
                              }}
                              className={`w-full flex items-center gap-2 text-sm py-1 px-1 rounded transition hover:bg-gray-50 ${isActive ? 'bg-orange-50' : ''}`}
                            >
                              <span className={`w-3 text-right ${isActive ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>{star}</span>
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-orange-400' : 'bg-yellow-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`w-8 text-right text-xs ${isActive ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sort */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('sort')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                >
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">เรียงตาม</h3>
                  {openSections.sort ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {openSections.sort && (
                  <div className="border-t border-gray-100">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setPage(1); }}
                        className={`w-full flex items-center px-4 py-2.5 text-sm transition hover:bg-gray-50 ${
                          sort === opt.value ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ===== REVIEWS AREA ===== */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่พบรีวิว</h3>
                <p className="text-gray-400 mb-4">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
                {isFiltered && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-300 px-4 py-2 rounded-lg"
                  >
                    <X className="w-4 h-4" /> ล้างตัวกรอง
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-500">
                    แสดง <span className="font-semibold text-gray-700">{reviews.length}</span> จาก <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> รีวิว
                  </p>
                </div>

                {/* Review Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 2)
                      .reduce<(number | string)[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        typeof item === 'string' ? (
                          <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                              page === item
                                ? 'bg-orange-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= lastPage}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
