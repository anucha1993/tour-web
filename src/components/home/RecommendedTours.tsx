'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  Calendar,
  Star,
  Plane,
  Sparkles,
} from 'lucide-react';
import { recommendedToursApi, RecommendedToursData, TourTabTour } from '@/lib/api';
import FavoriteButton from './FavoriteButton';

function RecommendedTourCard({ tour, index }: { tour: TourTabTour; index: number }) {
  const discountAdult = Number(tour.discount_adult || 0);
  const price = Number(tour.price || 0);
  const originalPrice = discountAdult > 0 ? price + discountAdult : null;
  const discountPercent = originalPrice ? Math.round((discountAdult / originalPrice) * 100) : 0;
  const isSoldOut = tour.available_seats === 0;

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={`cursor-pointer group relative flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 ${isSoldOut ? 'opacity-75' : ''}`}
    >
      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-30 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
        {index + 1}
      </div>

      {/* Favorite button */}
      {!isSoldOut && (
        <div className="absolute top-3 right-3 z-30 sm:hidden">
          <FavoriteButton tour={{ id: tour.id, title: tour.title, slug: tour.slug, image_url: tour.image_url, price: tour.price, country_name: tour.country.name, days: tour.days, nights: tour.nights, tour_code: tour.tour_code }} size="sm" />
        </div>
      )}

      {/* Image - landscape on desktop */}
      <div className="relative sm:w-[220px] lg:w-[260px] flex-shrink-0 aspect-[4/3] sm:aspect-auto overflow-hidden">
        {/* SOLD OUT Stamp */}
        {isSoldOut && (
          <div className="absolute -right-10 top-6 rotate-45 bg-red-500 text-white text-xs font-bold px-12 py-1.5 shadow-lg z-30">
            SOLD OUT
          </div>
        )}
        
        {tour.image_url ? (
          <Image
            src={tour.image_url}
            alt={tour.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isSoldOut ? 'grayscale-[30%]' : ''}`}
            sizes="(max-width: 640px) 100vw, 260px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-amber-300" />
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && !isSoldOut && (
          <div className="absolute top-3 right-3 z-20 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            -{discountPercent}%
          </div>
        )}

        {/* Country overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 z-10">
          <div className="flex items-center gap-1 text-white text-xs font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {tour.country?.name || 'ไม่ระบุ'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          {/* Tour code & badge */}
          <div className="flex items-center gap-2 mb-1.5">
            {tour.tour_code && (
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{tour.tour_code}</span>
            )}
            {tour.badge && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{tour.badge}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors mb-2">
            {tour.title}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {tour.days} วัน {tour.nights} คืน
            </span>
            {tour.airline && (
              <span className="flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 text-gray-400" />
                {tour.airline}
              </span>
            )}
            {tour.rating && tour.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-700">{tour.rating.toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Departure */}
          {tour.departure_date && (
            <div className="mt-1.5 text-[11px] text-gray-400">
              เดินทาง: {new Date(tour.departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              {tour.max_departure_date && tour.max_departure_date !== tour.departure_date && (
                <> - {new Date(tour.max_departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">เริ่มต้น</p>
            {originalPrice && discountAdult > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-red-500">
                  ฿{price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ฿{originalPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-bold text-amber-600">
                ฿{price.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isSoldOut && (
              <div className="hidden sm:block">
                <FavoriteButton tour={{ id: tour.id, title: tour.title, slug: tour.slug, image_url: tour.image_url, price: tour.price, country_name: tour.country.name, days: tour.days, nights: tour.nights, tour_code: tour.tour_code }} size="sm" />
              </div>
            )}
            <span className="text-xs text-amber-500 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
              ดูรายละเอียด
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RecommendedTours() {
  const [data, setData] = useState<RecommendedToursData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const response = await recommendedToursApi.get();
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch recommended tours:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommended();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-amber-100 rounded animate-pulse mx-auto" />
            <div className="h-4 w-72 bg-amber-50 rounded animate-pulse mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="w-[220px] flex-shrink-0 bg-amber-50 animate-pulse" style={{ minHeight: 160 }} />
                <div className="flex-1 p-5 space-y-3">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.tours.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-amber-500" />
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-gray-500 mt-1 ml-9">
                {data.subtitle}
              </p>
            )}
          </div>
          <Link
            href="/tours"
            className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            ดูทัวร์ทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tour Grid - 2 columns horizontal cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.tours.map((tour, idx) => (
            <RecommendedTourCard key={tour.id} tour={tour} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
