'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Star, StarHalf, ArrowLeft, Eye, ThumbsUp, MessageCircle,
  Calendar, ChevronLeft, ChevronRight, ImageIcon, Quote, Share2, X,
} from 'lucide-react';
import { reviewApi, TourReview } from '@/lib/api';
import { API_URL } from '@/lib/config';

// ── Helpers ──

function resolveImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_URL.replace('/api', '') + url;
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const full = Math.floor(rating);
  const hasHalf = rating !== full;
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
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

const CATEGORY_LABELS: Record<string, string> = {
  guide: 'ไกด์',
  food: 'อาหาร',
  hotel: 'ที่พัก',
  value: 'ความคุ้มค่า',
  program_accuracy: 'โปรแกรมตรงปก',
  would_return: 'อยากกลับไปอีก',
};

const TOUR_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  individual: { label: 'บุคคล/ทั่วไป', icon: '👤', color: 'bg-gray-100 text-gray-600' },
  private: { label: 'เหมาส่วนตัว', icon: '👨‍👩‍👧‍👦', color: 'bg-blue-100 text-blue-700' },
  corporate: { label: 'กรุ๊ปบริษัท', icon: '🏢', color: 'bg-purple-100 text-purple-700' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Image Gallery ──

function ImageGallery({ images }: { images: TourReview['images'] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) return null;
  const total = images.length;

  return (
    <>
      {/* Main image */}
      <div
        className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group"
        onClick={() => setLightbox(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(images[current].image_url)}
          alt="รูปภาพรีวิว"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5" />
          {current + 1}/{total}
        </div>
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + total) % total); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % total); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImageUrl(img.thumbnail_url || img.image_url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
            onClick={() => setLightbox(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(images[current].image_url)}
              alt="รูปภาพรีวิว"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            {total > 1 && (
              <>
                <button
                  onClick={() => setCurrent((c) => (c - 1 + total) % total)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => setCurrent((c) => (c + 1) % total)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            <div className="text-center text-white/70 text-sm mt-3">
              {current + 1} / {total}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Related Review Card ──

function RelatedCard({ review }: { review: TourReview }) {
  const avgRating = review.category_ratings
    ? parseFloat((Object.values(review.category_ratings).reduce((a: number, b: number) => a + b, 0) / Object.values(review.category_ratings).length).toFixed(1))
    : review.rating;

  return (
    <Link href={`/reviews/${review.id}`} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {review.images && review.images.length > 0 && (
        <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImageUrl(review.images[0].image_url)}
            alt=""
            className="w-full h-full object-cover"
          />
          {review.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <ImageIcon className="w-3 h-3" />
              {review.images.length}
            </div>
          )}
        </div>
      )}
      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{review.comment}</p>
      <div className="flex items-center gap-2">
        {review.reviewer_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(review.reviewer_avatar_url)} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xs">{review.reviewer_name?.charAt(0)}</span>
          </div>
        )}
        <span className="text-xs text-gray-600 truncate flex-1">{review.reviewer_name}</span>
        <StarRating rating={avgRating} size="sm" />
      </div>
      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{(review.views_count || 0).toLocaleString()}</span>
        <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{review.helpful_count || 0}</span>
      </div>
    </Link>
  );
}

// ── Main Page ──

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reviewId = parseInt(id);
  const isValidId = !isNaN(reviewId);

  const [review, setReview] = useState<TourReview | null>(null);
  const [relatedReviews, setRelatedReviews] = useState<TourReview[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<TourReview[]>([]);
  const [loading, setLoading] = useState(isValidId);
  const [notFound, setNotFound] = useState(!isValidId);
  const [viewsCount, setViewsCount] = useState(0);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [helpfulClicked, setHelpfulClicked] = useState(false);

  useEffect(() => {
    if (!isValidId) return;

    reviewApi.getReview(reviewId).then((res) => {
      if (res.success && res.data) {
        setReview(res.data.review);
        setRelatedReviews(res.data.related_reviews || []);
        setFeaturedReviews(res.data.featured_reviews || []);
        setViewsCount(res.data.review.views_count || 0);
        setHelpfulCount(res.data.review.helpful_count || 0);

        // Record view
        reviewApi.recordView(reviewId).then((vRes) => {
          if (vRes.success && vRes.data) {
            setViewsCount(vRes.data.views_count);
          }
        }).catch(() => {});
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [isValidId, reviewId]);

  const handleHelpful = async () => {
    if (!review || helpfulClicked) return;
    try {
      setHelpfulClicked(true);
      const res = await reviewApi.markHelpful(review.id);
      if (res.success && res.data) {
        setHelpfulCount(res.data.helpful_count);
      }
    } catch { /* ignore */ }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `รีวิวจาก ${review?.reviewer_name}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-4">กำลังโหลดรีวิว...</p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (notFound || !review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">ไม่พบรีวิว</h1>
          <p className="text-gray-500 mb-6">รีวิวนี้อาจถูกลบหรือยังไม่ได้รับการอนุมัติ</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = review.category_ratings && Object.keys(review.category_ratings).length > 0
    ? parseFloat((Object.values(review.category_ratings).reduce((a: number, b: number) => a + b, 0) / Object.values(review.category_ratings).length).toFixed(1))
    : review.rating;
  const tourType = review.tour_type ? TOUR_TYPE_LABELS[review.tour_type] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">หน้าหลัก</Link>
            <span>/</span>
            <span className="text-gray-800">รีวิว</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 lg:py-10">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ย้อนกลับ
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="p-4 sm:p-6 pb-0">
                  <ImageGallery images={review.images} />
                </div>
              )}

              {/* Content */}
              <div className="p-4 sm:p-6">
                {/* Reviewer info */}
                <div className="flex items-start gap-4 mb-5">
                  {review.reviewer_avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(review.reviewer_avatar_url)}
                      alt={review.reviewer_name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                      {review.reviewer_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg text-gray-900">{review.reviewer_name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={avgRating} size="md" />
                        <span className="text-sm font-semibold text-yellow-600">{avgRating}</span>
                      </div>
                      {review.is_featured && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⭐ แนะนำ</span>
                      )}
                      {tourType && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tourType.color}`}>
                          {tourType.icon} {tourType.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(review.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {viewsCount.toLocaleString()} เข้าชม
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quote + Comment */}
                <div className="relative pl-4 border-l-4 border-blue-200 mb-5">
                  <Quote className="absolute -left-3 -top-1 w-6 h-6 text-blue-200 rotate-180 bg-white" />
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {review.comment}
                  </p>
                </div>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {review.tags.map((tag, i) => (
                      <span key={i} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Category Ratings */}
                {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">คะแนนรายหมวด</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(review.category_ratings).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{CATEGORY_LABELS[key] || key}</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-800">{val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Reply */}
                {review.admin_reply && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">ตอบกลับจากผู้ดูแล</span>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{review.admin_reply}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleHelpful}
                    disabled={helpfulClicked}
                    className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-colors ${
                      helpfulClicked
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${helpfulClicked ? 'fill-blue-500' : ''}`} />
                    มีประโยชน์ {helpfulCount > 0 ? `(${helpfulCount})` : ''}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    แชร์
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Tour Info Card */}
            {review.tour && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {review.tour.cover_image_url && (
                  <div className="relative w-full aspect-[16/9] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(review.tour.cover_image_url)}
                      alt={review.tour.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ImageIcon className="w-3 h-3" />
                      1/1
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {review.tour.title}
                  </h3>
                  {review.tour.tour_code && (
                    <p className="text-xs text-gray-400 mb-3">รหัส: {review.tour.tour_code}</p>
                  )}
                  <Link
                    href={`/tours/${review.tour.slug}`}
                    className="block text-center text-sm bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    ดูรายละเอียดทัวร์
                  </Link>
                </div>
              </div>
            )}

            {/* Related Reviews */}
            {relatedReviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">รีวิวอื่นๆ ของทัวร์นี้</h3>
                <div className="space-y-4">
                  {relatedReviews.map((r) => (
                    <RelatedCard key={r.id} review={r} />
                  ))}
                </div>
              </div>
            )}

            {/* Featured / Recommended Reviews */}
            {featuredReviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">⭐ รีวิวแนะนำ</h3>
                <div className="space-y-4">
                  {featuredReviews.map((r) => (
                    <RelatedCard key={r.id} review={r} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
