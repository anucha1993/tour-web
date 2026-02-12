'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight,
  MapPin,
  Calendar,
  Star,
  Plane,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hotel,
} from 'lucide-react';
import { tourTabsApi, TourTabData, TourTabTour } from '@/lib/api';
import FavoriteButton from './FavoriteButton';
import TourTabBadges from '@/components/shared/TourTabBadges';

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

  // Format view count
  const formatViewCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

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

        {/* Favorite button */}
        {!isSoldOut && (
          <div className="absolute top-3 right-3 z-30">
            <FavoriteButton tour={{ id: tour.id, title: tour.title, slug: tour.slug, image_url: tour.image_url, price: tour.price, country_name: tour.country.name, days: tour.days, nights: tour.nights, tour_code: tour.tour_code }} size="sm" />
          </div>
        )}
        
        {/* Bottom info overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-1 text-white text-sm">
            <MapPin className="w-4 h-4" />
            {tour.country.name}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Tour code + badges row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-xs font-mono text-[var(--color-gray-400)]">{tour.tour_code}</span>
          {discountPercent > 0 && !isSoldOut && (
            <span className="text-[10px] font-bold text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded">
              ลด {discountPercent}%
            </span>
          )}

          {tour.badge && !isSoldOut && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {tour.badge}
            </span>
          )}
          {!isSoldOut && <TourTabBadges tourId={tour.id} />}
        </div>

        <h3 className="font-semibold text-sm text-[var(--color-gray-800)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[40px]">
          {tour.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-gray-500)]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {tour.days}วัน {tour.nights}คืน
          </span>
          {tour.airline && (
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5" />
              {tour.airline}
            </span>
          )}
          {tour.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {tour.rating}
            </span>
          )}
        </div>

        {/* Departure */}
        {tour.departure_date && (
          <div className="mt-1.5 text-xs text-[var(--color-gray-500)]">
            📅 {new Date(tour.departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            {tour.max_departure_date && tour.max_departure_date !== tour.departure_date && (
              <> - {new Date(tour.max_departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</>
            )}
          </div>
        )}

        {/* Hotel star */}
        {tour.hotel_star && tour.hotel_star > 0 && (
          <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-gray-500)]">
            <Hotel className="w-3.5 h-3.5 text-amber-500" />
            {Array.from({ length: tour.hotel_star }, (_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-gray-500)]">เริ่มต้น</p>
              {originalPrice && discountAdult > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-[var(--color-gray-400)] line-through">
                    ฿{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-red-500">
                    ฿{price.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  ฿{price.toLocaleString()}
                </span>
              )}
            </div>
            {/* View count - แสดงเสมอ */}
            <div className="flex items-center gap-1 text-[var(--color-gray-500)] text-xs bg-gray-100 rounded-full px-2.5 py-1">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-medium">{formatViewCount(tour.view_count ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TourTabs() {
  const [tabs, setTabs] = useState<TourTabData[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8); // 4 columns × 2 rows
  const [colsPerRow, setColsPerRow] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [arrowTop, setArrowTop] = useState<string>('50%');

  // Calculate arrow position based on first card height
  useEffect(() => {
    const calcArrowPos = () => {
      if (!containerRef.current) return;
      const firstCard = containerRef.current.querySelector('.tour-grid > a');
      if (firstCard) {
        const cardHeight = (firstCard as HTMLElement).offsetHeight;
        // ตำแหน่ง = ความสูง card แถว 1 + ครึ่ง gap (gap=16px → 8px)
        setArrowTop(`${cardHeight + 5}px`);
      }
    };
    calcArrowPos();
    window.addEventListener('resize', calcArrowPos);
    return () => window.removeEventListener('resize', calcArrowPos);
  }, [currentPage, activeTab, loading, tabs]);

  // Responsive: update columns and items per page based on screen width
  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 640) {
        setColsPerRow(1);
        setItemsPerPage(2); // 1 col × 2 rows
      } else if (window.innerWidth < 1024) {
        setColsPerRow(2);
        setItemsPerPage(4); // 2 cols × 2 rows
      } else {
        setColsPerRow(4);
        setItemsPerPage(8); // 4 cols × 2 rows
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  useEffect(() => {
    async function fetchTabs() {
      try {
        const response = await tourTabsApi.list();
        if (response.success && response.data) {
          setTabs(response.data.filter((t: TourTabData) => t.display_mode === 'tab' || t.display_mode === 'both'));
        }
      } catch (error) {
        console.error('Failed to fetch tour tabs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTabs();
  }, []);

  const currentTab = !loading && tabs.length > 0 ? tabs[activeTab] : null;
  const tours = currentTab?.tours ?? [];
  const totalPages = Math.ceil(tours.length / itemsPerPage);
  const maxPage = Math.max(0, totalPages - 1);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev <= 0 ? maxPage : prev - 1));
  }, [maxPage]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev >= maxPage ? 0 : prev + 1));
  }, [maxPage]);

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

          {/* Cards skeleton - 2 rows × 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mt-1" />
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

        {/* Tour Carousel - 2 rows × 4 cols */}
        {tours.length > 0 ? (
          <div className="relative" ref={containerRef}>
            {/* Navigation Arrows */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  className="cursor-pointer absolute -left-4 lg:-left-6 -translate-y-1/2 w-10 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                  style={{ top: arrowTop }}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextPage}
                  className="cursor-pointer absolute -right-4 lg:-right-6 -translate-y-1/2 w-10 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                  style={{ top: arrowTop }}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentPage * 100}%)`,
                }}
              >
                {/* Each page = 2 rows × colsPerRow cards */}
                {Array.from({ length: totalPages }).map((_, pageIndex) => {
                  const pageStart = pageIndex * itemsPerPage;
                  const pageTours = tours.slice(pageStart, pageStart + itemsPerPage);
                  return (
                    <div
                      key={pageIndex}
                      className="w-full flex-shrink-0"
                    >
                      <div className={`tour-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
                        {pageTours.map((tour) => (
                          <TourCard key={tour.id} tour={tour} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dots Indicator */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPage
                        ? 'bg-[var(--color-primary)] w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
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
