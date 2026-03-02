'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Star, StarHalf, Quote, ChevronLeft, ChevronRight, MessageSquare, ImageIcon, Eye } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { TourReview } from '@/lib/api';

// Helper: resolve image URL (R2 absolute URLs vs legacy /storage/ paths)
function resolveImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_URL.replace('/api', '') + url;
}

// Compute average from category ratings
function computeAvgRating(review: TourReview): number {
  if (review.category_ratings && Object.keys(review.category_ratings).length > 0) {
    const vals = Object.values(review.category_ratings).map(Number);
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
  }
  return review.rating;
}

// Star display with half-star
function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating !== full;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        if (s <= full)
          return <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
        if (s === full + 1 && hasHalf)
          return <StarHalf key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
        return <Star key={s} className="w-4 h-4 text-gray-200" />;
      })}
    </div>
  );
}

// Skeleton loading
function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-3/5 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Mini image carousel inside review card
function ImageCarousel({ images }: { images: TourReview['images'] }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;

  const total = images.length;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + total) % total);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % total);
  };

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-gray-100 group/img">
      {/* Current image */}
      <img
        src={resolveImageUrl(images[current].image_url)}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Image count badge */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
        <ImageIcon className="w-3 h-3" />
        {current + 1}/{total}
      </div>

      {/* Arrows (show if > 1 image) */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover/img:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover/img:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Single review card
function ReviewCard({ review }: { review: TourReview }) {
  const avgRating = computeAvgRating(review);
  const tourTitle = review.tour?.tour_name || '';
  const tourSlug = review.tour?.slug || '';

  return (
    <Link href={`/reviews/${review.id}`} className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group block">
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-[var(--color-primary)]/20 mb-3 rotate-180" />

      {/* Comment */}
      <p className="text-sm text-[var(--color-gray-600)] leading-relaxed mb-4 line-clamp-3 min-h-[60px]">
        {review.comment}
      </p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {review.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[11px] bg-[var(--color-primary-50)] text-[var(--color-primary)] px-2 py-0.5 rounded-full font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Review images carousel */}
      {review.images && review.images.length > 0 && (
        <ImageCarousel images={review.images} />
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.reviewer_avatar_url ? (
            <img
              src={resolveImageUrl(review.reviewer_avatar_url)}
              alt={review.reviewer_name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-50)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {review.reviewer_name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-[var(--color-gray-800)] truncate">
              {review.reviewer_name}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={avgRating} />
              <span className="text-xs font-medium text-yellow-600">{avgRating}</span>
            </div>
          </div>
        </div>

        {/* Tour name + views */}
        <div className="flex items-center justify-between mt-2">
          {tourTitle ? (
            <span className="text-xs text-[var(--color-gray-400)] truncate flex-1 min-w-0">
              ทัวร์: {tourTitle}
            </span>
          ) : <span />}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0 ml-2">
            <Eye className="w-3 h-3" />
            <span>{(review.views_count || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollSpeedRef = useRef(0.5);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/reviews/featured?limit=12`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data.success && data.data) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch featured reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Infinite auto-scroll
  const animate = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    container.scrollLeft += scrollSpeedRef.current;

    const halfScroll = container.scrollWidth / 2;
    if (container.scrollLeft >= halfScroll) {
      container.scrollLeft -= halfScroll;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    if (reviews.length === 0) return;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [reviews, animate]);

  const scrollBy = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -380 : 380;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Don't render if no reviews and done loading
  if (!isLoading && reviews.length === 0) return null;

  const loopReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)] flex items-center justify-center gap-2">
            <MessageSquare className="w-7 h-7 text-[var(--color-primary)]" />
            รีวิวจากลูกค้า
          </h2>
          <p className="text-[var(--color-gray-500)] mt-2">
            เสียงจากลูกค้าที่ไว้วางใจเดินทางกับเรา
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="relative">
            <div className="flex gap-5 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-50 to-transparent" />
          </div>
        )}

        {/* Reviews Carousel */}
        {!isLoading && reviews.length > 0 && (
          <div className="relative group/carousel">
            {/* Left Arrow */}
            <button
              onClick={() => scrollBy('left')}
              className="absolute -left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="เลื่อนซ้าย"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollBy('right')}
              className="absolute -right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="เลื่อนขวา"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* Scrolling Track */}
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex gap-5 overflow-x-hidden scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loopReviews.map((review, index) => (
                <ReviewCard key={`${review.id}-${index}`} review={review} />
              ))}
            </div>

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-50 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
