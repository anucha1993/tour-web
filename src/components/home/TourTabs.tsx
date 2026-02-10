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
} from 'lucide-react';
import { tourTabsApi, TourTabData, TourTabTour } from '@/lib/api';
import FavoriteButton from './FavoriteButton';

// Badge color mapping
const BADGE_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

function TourCard({ tour }: { tour: TourTabTour }) {
  const discountAdult = Number(tour.discount_adult || 0);
  const price = Number(tour.price || 0);
  const originalPrice = discountAdult > 0 ? price + discountAdult : null;
  const discountPercent = originalPrice ? Math.round((discountAdult / originalPrice) * 100) : 0;
  const isSoldOut = tour.available_seats === 0;

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={`cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isSoldOut ? 'opacity-75' : ''}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--color-gray-200)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        
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
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${isSoldOut ? 'grayscale-[30%]' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 800px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-gray-400)]">
            <Plane className="w-12 h-12" />
          </div>
        )}
        
        {/* Discount badge */}
        {discountPercent > 0 && !isSoldOut && (
          <div className="absolute top-3 left-3 z-20 bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded">
            ลด {discountPercent}%
          </div>
        )}
        
        {/* Tour badge */}
        {tour.badge && !isSoldOut && (
          <div className="absolute top-3 right-3 z-20 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
            {tour.badge}
          </div>
        )}

        {/* Favorite button */}
        {!isSoldOut && (
          <div className="absolute top-3 right-3 z-30" style={tour.badge ? { top: '2.75rem' } : undefined}>
            <FavoriteButton tour={{ id: tour.id, title: tour.title, slug: tour.slug, image_url: tour.image_url, price: tour.price, country_name: tour.country.name, days: tour.days, nights: tour.nights, tour_code: tour.tour_code }} size="sm" />
          </div>
        )}
        
        {/* Destination */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 text-white text-sm">
          <MapPin className="w-4 h-4" />
          {tour.country.name}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-mono text-[var(--color-gray-400)] mb-1">{tour.tour_code}</p>
        <h3 className="font-semibold text-[var(--color-gray-800)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[48px]">
          {tour.title}
        </h3>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-gray-500)]">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {tour.days} วัน {tour.nights} คืน
          </span>
          {tour.airline && (
            <span className="flex items-center gap-1">
              <Plane className="w-4 h-4" />
              {tour.airline}
            </span>
          )}
          {tour.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {tour.rating}
            </span>
          )}
        </div>

        {tour.departure_date && (
          <div className="mt-2 text-xs text-[var(--color-gray-500)]">
            <span>📅 {new Date(tour.departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
            {tour.max_departure_date && tour.max_departure_date !== tour.departure_date && (
              <span> - {new Date(tour.max_departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-[var(--color-gray-500)]">เริ่มต้น</p>
          {originalPrice && discountAdult > 0 ? (
            <>
              <span className="text-sm text-[var(--color-gray-400)] line-through">
                ฿{originalPrice.toLocaleString()}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-red-500">
                  ฿{price.toLocaleString()}
                </span>
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-red-500">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-xl font-bold text-[var(--color-primary)]">
              ฿{price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function TourTabs() {
  const [tabs, setTabs] = useState<TourTabData[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTabs() {
      try {
        const response = await tourTabsApi.list();
        if (response.success && response.data) {
          setTabs(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch tour tabs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTabs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-[var(--color-gray-50)]">
        <div className="container-custom">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Tabs skeleton */}
          <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-9 rounded-full animate-pulse ${i === 0 ? 'w-28 bg-white shadow-sm' : 'w-24 bg-gray-200'}`} />
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tabs.length === 0) {
    return null;
  }

  const currentTab = tabs[activeTab];

  return (
    <section className="py-16 lg:py-20 bg-[var(--color-gray-50)]">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)]">
              เลือกทัวร์ที่ใช่ในสไตล์คุณ
            </h2>
            <p className="text-[var(--color-gray-500)] mt-1">
              ทัวร์คุณภาพคัดสรรมาเพื่อคุณโดยเฉพาะ
            </p>
          </div>
          <Link
            href="/tours"
            className="flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors"
          >
            ดูทัวร์ทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full mb-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === index
                  ? 'bg-white text-[var(--color-gray-800)] shadow-sm'
                  : 'text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)]'
              }`}
            >
              {tab.name}
              {tab.badge_text && (
                <span 
                  className={`px-1.5 py-0.5 text-xs rounded-full text-white ${
                    BADGE_COLORS[tab.badge_color || 'orange'] || BADGE_COLORS.orange
                  }`}
                >
                  {tab.badge_text}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Description */}
        {currentTab?.description && (
          <p className="text-[var(--color-gray-500)] mb-6">
            {currentTab.description}
          </p>
        )}

        {/* Tour Grid */}
        {currentTab?.tours && currentTab.tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentTab.tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--color-gray-500)]">
            ไม่มีทัวร์ในหมวดหมู่นี้
          </div>
        )}
      </div>
    </section>
  );
}
