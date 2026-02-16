'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  Star,
  Plane,
  Eye,
  Loader2,
  Tag,
  Hotel,
  Sparkles,
  Search,
} from 'lucide-react';
import { tourTabsApi, TourTabData, TourTabTour, InternationalTourFilters } from '@/lib/api';
import FavoriteButton from '@/components/home/FavoriteButton';
import TourTabBadges from '@/components/shared/TourTabBadges';
import TourSearchForm, { SearchParams } from '@/components/shared/TourSearchForm';

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

function PromotionTourCard({ tour, tabBadge }: { tour: TourTabTour; tabBadge?: { text: string; color: string; icon?: string } }) {
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
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-gray-400)]">
            <Plane className="w-12 h-12" />
          </div>
        )}

        {/* Favorite button */}
        {!isSoldOut && (
          <div className="absolute top-3 right-3 z-30">
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

        {/* Discount badge */}
        {discountPercent > 0 && !isSoldOut && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
              ลด {discountPercent}%
            </span>
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
          {tour.badge && !isSoldOut && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {tour.badge}
            </span>
          )}
          {!isSoldOut && <TourTabBadges tourId={tour.id} />}
          {tabBadge && !isSoldOut && (
            <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${BADGE_COLORS[tabBadge.color] || 'bg-orange-500'}`}>
              {tabBadge.icon && <span className="mr-0.5">{tabBadge.icon}</span>}
              {tabBadge.text}
            </span>
          )}
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

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'days_asc' | 'days_desc' | 'discount';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'ค่าเริ่มต้น' },
  { value: 'price_asc', label: 'ราคาต่ำ - สูง' },
  { value: 'price_desc', label: 'ราคาสูง - ต่ำ' },
  { value: 'discount', label: 'ส่วนลดมากสุด' },
  { value: 'days_asc', label: 'จำนวนวันน้อย - มาก' },
  { value: 'days_desc', label: 'จำนวนวันมาก - น้อย' },
];

function sortTours(tours: TourTabTour[], sort: SortOption): TourTabTour[] {
  const sorted = [...tours];
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
    case 'price_desc':
      return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case 'discount':
      return sorted.sort((a, b) => {
        const discA = Number(a.discount_adult || 0);
        const discB = Number(b.discount_adult || 0);
        const pctA = discA > 0 && a.price ? discA / (Number(a.price) + discA) : 0;
        const pctB = discB > 0 && b.price ? discB / (Number(b.price) + discB) : 0;
        return pctB - pctA;
      });
    case 'days_asc':
      return sorted.sort((a, b) => a.days - b.days);
    case 'days_desc':
      return sorted.sort((a, b) => b.days - a.days);
    default:
      return sorted;
  }
}

/** Build InternationalTourFilters from loaded promotion tours for TourSearchForm */
function buildFiltersFromTours(tabs: TourTabData[]): InternationalTourFilters {
  const allTours = tabs.flatMap(t => t.tours);

  // Countries
  const countryMap = new Map<number, { id: number; name_th: string; slug: string; iso2: string; tour_count: number }>();
  allTours.forEach(t => {
    const existing = countryMap.get(t.country.id);
    if (existing) {
      existing.tour_count++;
    } else {
      countryMap.set(t.country.id, {
        id: t.country.id,
        name_th: t.country.name,
        slug: '',
        iso2: t.country.iso2 || '',
        tour_count: 1,
      });
    }
  });

  // Airlines (use index as pseudo-id since TourTabTour only has airline name)
  const airlineNames = new Set<string>();
  allTours.forEach(t => { if (t.airline) airlineNames.add(t.airline); });
  const airlines = Array.from(airlineNames).sort().map((name, i) => ({
    id: i + 1,
    code: name,
    name: name,
    image: null,
  }));

  // Departure months
  const monthSet = new Set<string>();
  allTours.forEach(t => {
    if (t.departure_date) monthSet.add(t.departure_date.substring(0, 7)); // "YYYY-MM"
    if (t.max_departure_date) monthSet.add(t.max_departure_date.substring(0, 7));
  });
  const TH_MONTHS: Record<string, string> = {
    '01': 'มกราคม', '02': 'กุมภาพันธ์', '03': 'มีนาคม', '04': 'เมษายน',
    '05': 'พฤษภาคม', '06': 'มิถุนายน', '07': 'กรกฎาคม', '08': 'สิงหาคม',
    '09': 'กันยายน', '10': 'ตุลาคม', '11': 'พฤศจิกายน', '12': 'ธันวาคม',
  };
  const departure_months = Array.from(monthSet).sort().map(ym => {
    const [y, m] = ym.split('-');
    return { value: ym, label: `${TH_MONTHS[m] || m} ${parseInt(y) + 543}` };
  });

  return {
    countries: Array.from(countryMap.values()).sort((a, b) => a.name_th.localeCompare(b.name_th)),
    cities: [],
    airlines,
    departure_months,
  };
}

export default function PromotionsPage() {
  const [promotionTabs, setPromotionTabs] = useState<TourTabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSearchParams, setActiveSearchParams] = useState<SearchParams>({});
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const response = await tourTabsApi.promotions();
        if (response.success && response.data) {
          setPromotionTabs(response.data);
          if (response.data.length > 0) {
            setActiveSection(response.data[0].slug);
          }
        }
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, []);

  // Build filters from loaded data for TourSearchForm
  const filters = useMemo(() => buildFiltersFromTours(promotionTabs), [promotionTabs]);

  const handleSearch = (params: SearchParams) => {
    setActiveSearchParams(params);
  };

  const clearFilters = () => {
    setActiveSearchParams({});
    setSortBy('default');
  };

  const scrollToSection = (slug: string) => {
    setActiveSection(slug);
    const element = document.getElementById(`promo-${slug}`);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Filter & sort tours using SearchParams from TourSearchForm
  const getFilteredTours = (tours: TourTabTour[]): TourTabTour[] => {
    let filtered = tours;
    const p = activeSearchParams;

    // Text search
    if (p.search?.trim()) {
      const q = p.search.trim().toLowerCase();
      filtered = filtered.filter((tour) =>
        tour.title.toLowerCase().includes(q) ||
        tour.tour_code.toLowerCase().includes(q) ||
        tour.country.name.toLowerCase().includes(q) ||
        (tour.airline && tour.airline.toLowerCase().includes(q))
      );
    }

    // Country filter
    if (p.country_id) {
      const cid = Number(p.country_id);
      filtered = filtered.filter(t => t.country.id === cid);
    }

    // Airline filter (match by name since we use name as code)
    if (p.airline_id) {
      const airline = filters.airlines?.find(a => String(a.id) === p.airline_id);
      if (airline) {
        filtered = filtered.filter(t => t.airline === airline.name);
      }
    }

    // Departure date range (from TourSearchForm month selection)
    if (p.departure_date_from) {
      const from = p.departure_date_from;
      filtered = filtered.filter(t => {
        if (!t.departure_date) return false;
        const maxDate = t.max_departure_date || t.departure_date;
        return maxDate >= from;
      });
    }
    if (p.departure_date_to) {
      const to = p.departure_date_to;
      filtered = filtered.filter(t => {
        if (!t.departure_date) return false;
        return t.departure_date <= to;
      });
    }

    // Price range
    if (p.price_min) {
      const min = Number(p.price_min);
      filtered = filtered.filter(t => (t.price ?? 0) >= min);
    }
    if (p.price_max) {
      const max = Number(p.price_max);
      filtered = filtered.filter(t => (t.price ?? 999999) <= max);
    }

    // Sort
    filtered = sortTours(filtered, sortBy);

    return filtered;
  };

  // Count total filtered tours
  const totalFilteredTours = useMemo(() => {
    return promotionTabs.reduce((sum, tab) => sum + getFilteredTours(tab.tours).length, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionTabs, activeSearchParams, sortBy]);

  const isInitialLoad = loading && promotionTabs.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>
        <div className="container mx-auto px-4 pt-10 pb-28 lg:pt-14 lg:pb-36 relative z-10">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6" />
              <Tag className="w-6 h-6" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              ทัวร์โปรโมชั่น
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              รวมโปรโมชั่นพิเศษ จัดเต็มทุกเส้นทาง ราคาดีที่สุดสำหรับคุณ
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Form - overlapping hero */}
        <div className="-mt-24 lg:-mt-30 relative z-20 mb-6">
          {isInitialLoad ? (
            <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
                <div className="flex items-end">
                  <div className="h-12 bg-orange-200 rounded-lg w-full" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-10 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-10 bg-gray-100 rounded-lg flex-1" />
                </div>
              </div>
            </div>
          ) : (
            <TourSearchForm
              filters={filters}
              onSearch={handleSearch}
              onClear={clearFilters}
              initialValues={activeSearchParams}
              showFilters={{
                search: true,
                country: true,
                city: false,
                airline: true,
                departureMonth: true,
                priceRange: true,
              }}
            />
          )}
        </div>

        {/* Results header + Sort */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base text-gray-600">
            {loading ? (
              <span className="flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> กำลังค้นหา...</span>
            ) : (
              <><strong className="text-gray-900">{totalFilteredTours}</strong> รายการ</>
            )}
          </span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-base"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Tab Pills */}
        {!loading && promotionTabs.length > 1 && (
          <div className="flex overflow-x-auto gap-1 mb-6 pb-1 scrollbar-hide">
            {promotionTabs.map((tab) => {
              const filteredCount = getFilteredTours(tab.tours).length;
              return (
                <button
                  key={tab.slug}
                  onClick={() => scrollToSection(tab.slug)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === tab.slug
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.badge_text && tab.badge_color && (
                    <span className={`w-2 h-2 rounded-full ${BADGE_COLORS[tab.badge_color] || 'bg-orange-500'}`} />
                  )}
                  {tab.name}
                  <span className="text-xs opacity-75">({filteredCount})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-12">
            {/* Skeleton: Tab section header */}
            {[1, 2].map(section => (
              <div key={section}>
                <div className="flex items-center gap-3 mb-6 animate-pulse">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-7 bg-gray-200 rounded w-48" />
                      <div className="h-5 bg-orange-100 rounded-full w-20" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-64 mt-2" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-16" />
                </div>
                {/* Skeleton: Tour cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-4 bg-gray-200 rounded w-16" />
                          <div className="h-4 bg-gray-100 rounded w-20" />
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3 bg-gray-200 rounded" />
                          <div className="h-4 bg-gray-100 rounded w-20" />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="h-3 bg-gray-100 rounded w-12" />
                          <div className="h-7 bg-orange-100 rounded w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : promotionTabs.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">ยังไม่มีโปรโมชั่นในขณะนี้</h2>
            <p className="text-gray-400 mb-6">กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {promotionTabs.map((tab) => {
              const filteredTours = getFilteredTours(tab.tours);

              return (
                <section
                  key={tab.id}
                  id={`promo-${tab.slug}`}
                  className="scroll-mt-[180px]"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                          {tab.icon && <span className="mr-1">{tab.icon}</span>}
                          {tab.name}
                        </h2>
                        {tab.badge_text && (
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full text-white ${
                            BADGE_COLORS[tab.badge_color || 'orange'] || 'bg-orange-500'
                          }`}>
                            {tab.badge_icon && <span className="mr-0.5">{tab.badge_icon}</span>}
                            {tab.badge_text}
                          </span>
                        )}
                      </div>
                      {tab.description && (
                        <p className="text-sm text-gray-500">{tab.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {filteredTours.length}{Object.keys(activeSearchParams).length > 0 ? ` / ${tab.tours.length}` : ''} ทัวร์
                    </div>
                  </div>

                  {/* Tour Grid */}
                  {filteredTours.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredTours.map((tour) => (
                        <PromotionTourCard
                          key={tour.id}
                          tour={tour}
                          tabBadge={tab.badge_text ? { text: tab.badge_text, color: tab.badge_color || 'orange', icon: tab.badge_icon } : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl">
                      <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400">ไม่พบทัวร์ที่ตรงกับเงื่อนไขการค้นหา</p>
                      <button onClick={clearFilters} className="mt-2 text-sm text-orange-600 hover:underline">
                        ล้างตัวกรองทั้งหมด
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'หน้าหลัก',
                item: '/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'ทัวร์โปรโมชั่น',
                item: '/promotions',
              },
            ],
          }),
        }}
      />
    </div>
  );
}
