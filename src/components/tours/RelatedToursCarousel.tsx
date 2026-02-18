'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Calendar, Star, Plane, ChevronLeft, ChevronRight,
  Eye, Hotel, Clock,
} from 'lucide-react';
import { tourDetailApi, TourTabTour } from '@/lib/api';
import FavoriteButton from '@/components/home/FavoriteButton';
import TourTabBadges from '@/components/shared/TourTabBadges';

function RelatedTourCard({ tour }: { tour: TourTabTour }) {
  const discountAdult = Number(tour.discount_adult || 0);
  const price = Number(tour.price || 0);
  const originalPrice = discountAdult > 0 ? price + discountAdult : null;
  const discountPercent = originalPrice ? Math.round((discountAdult / originalPrice) * 100) : 0;
  const isSoldOut = tour.available_seats === 0;

  const formatViewCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={`cursor-pointer group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[var(--color-primary)]/30 shadow-sm hover:shadow-lg transition-all duration-300 flex-shrink-0 flex flex-col ${isSoldOut ? 'opacity-70' : ''}`}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-[var(--color-gray-200)] overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

        {/* SOLD OUT */}
        {isSoldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-white font-bold text-sm tracking-wider">SOLD OUT</span>
            </div>
          </div>
        )}

        {/* Discount badge - top left */}
        {discountPercent > 0 && !isSoldOut && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <div className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-md">
              -{discountPercent}%
            </div>
          </div>
        )}

        {tour.image_url ? (
          <Image
            src={tour.image_url}
            alt={tour.title}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${isSoldOut ? 'grayscale-[40%]' : ''}`}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-gray-400)]">
            <Plane className="w-10 h-10" />
          </div>
        )}

        {/* Favorite button */}
        {!isSoldOut && (
          <div className="absolute top-2.5 right-2.5 z-30">
            <FavoriteButton
              tour={{
                id: tour.id,
                title: tour.title,
                slug: tour.slug,
                image_url: tour.image_url,
                price: tour.price,
                country_name: tour.country.name,
                days: tour.days,
                nights: tour.nights,
                tour_code: tour.tour_code,
              }}
              size="sm"
            />
          </div>
        )}

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-2.5 flex items-end justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[var(--color-gray-700)] text-[11px] font-medium px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              {tour.country.name}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[var(--color-gray-700)] text-[11px] font-medium px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              {tour.days}D{tour.nights}N
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-[var(--color-gray-400)] bg-gray-50 px-1.5 py-0.5 rounded">{tour.tour_code}</span>
          {tour.badge && !isSoldOut && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {tour.badge}
            </span>
          )}
          {!isSoldOut && <TourTabBadges tourId={tour.id} />}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[13px] leading-snug text-[var(--color-gray-800)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[36px]">
          {tour.title}
        </h3>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {tour.airline && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-gray-500)] bg-blue-50 px-1.5 py-0.5 rounded">
              <Plane className="w-3 h-3 text-blue-400" />
              {tour.airline}
            </span>
          )}
          {tour.rating && tour.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {tour.rating}
            </span>
          )}
          {tour.hotel_star && tour.hotel_star > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              <Hotel className="w-3 h-3 text-amber-500" />
              {tour.hotel_star}★
            </span>
          )}
        </div>

        {/* Departure date */}
        {tour.departure_date && (
          <div className="mt-1.5 text-[11px] text-[var(--color-gray-500)]">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(tour.departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              {tour.max_departure_date && tour.max_departure_date !== tour.departure_date && (
                <> - {new Date(tour.max_departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</>
              )}
            </span>
          </div>
        )}

        {/* Price - pushed to bottom */}
        <div className="mt-auto pt-2.5">
          <div className="flex items-end justify-between border-t border-gray-100 pt-2.5">
            <div>
              <p className="text-[10px] text-[var(--color-gray-400)] uppercase tracking-wider mb-0.5">เริ่มต้น</p>
              {originalPrice && discountAdult > 0 ? (
                <div>
                  <span className="text-[11px] text-[var(--color-gray-400)] line-through mr-1">
                    ฿{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-red-500 leading-none">
                    ฿{price.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-[var(--color-primary)] leading-none">
                  ฿{price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[var(--color-gray-400)] text-[11px]">
              <Eye className="w-3 h-3" />
              <span>{formatViewCount(tour.view_count ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RelatedToursCarousel({ tourSlug }: { tourSlug: string }) {
  const [tours, setTours] = useState<TourTabTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Fetch related tours
  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await tourDetailApi.getRelatedTours(tourSlug);
        if (res.success && res.data) {
          setTours(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch related tours:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [tourSlug]);

  const maxIndex = Math.max(0, tours.length - itemsPerView);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  // Reset index on resize if out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-3 space-y-2.5">
                <div className="flex gap-1.5">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="pt-2.5 border-t border-gray-100">
                  <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tours.length === 0) return null;

  // Calculate card width percentage based on items per view
  const cardWidthPercent = 100 / itemsPerView;
  const gapPx = 16; // gap-4 = 16px

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-[var(--color-primary)] rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-gray-800)]">
            ทัวร์แนะนำที่คล้ายกัน
          </h2>
          <span className="text-xs text-[var(--color-gray-400)] bg-gray-100 px-2 py-0.5 rounded-full">
            {tours.length} ทัวร์
          </span>
        </div>
        {tours.length > itemsPerView && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={prev}
              className="cursor-pointer w-9 h-9 rounded-full border border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-gray-500)] flex items-center justify-center transition-all duration-200"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="cursor-pointer w-9 h-9 rounded-full border border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-gray-500)] flex items-center justify-center transition-all duration-200"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={containerRef}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: `${gapPx}px`,
            transform: `translateX(calc(-${currentIndex * cardWidthPercent}% - ${currentIndex * gapPx / itemsPerView}px))`,
          }}
        >
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="flex-shrink-0"
              style={{ width: `calc(${cardWidthPercent}% - ${gapPx * (itemsPerView - 1) / itemsPerView}px)` }}
            >
              <RelatedTourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator (mobile) */}
      {tours.length > itemsPerView && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-[var(--color-primary)] w-5'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
