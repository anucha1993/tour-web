'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Calendar,
  Plane,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Flame,
  Crown,
} from 'lucide-react';
import {
  internationalToursApi,
  InternationalTourItem,
  InternationalTourFilters,
  InternationalTourSettings,
  InternationalTourPeriod,
} from '@/lib/api';

// Reusable helpers (same as international page)
const formatPrice = (price: number | null | undefined) => {
  if (!price) return '-';
  return new Intl.NumberFormat('th-TH').format(price);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = thMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month}${String(year).slice(-2)}`;
};

const formatDateRange = (start: string, end: string) => `${formatDate(start)} - ${formatDate(end)}`;

const getDayOfWeek = (dateStr: string) => {
  const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  return days[new Date(dateStr).getDay()];
};

const PeriodStatusBadge = ({ period }: { period: InternationalTourPeriod }) => {
  if (period.status === 'closed' || period.available <= 0)
    return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">CLOSED</span>;
  if (period.available <= 5)
    return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">{period.available}</span>;
  return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">{period.available}</span>;
};

const TourBadge = ({ badge }: { badge: string }) => {
  const colors: Record<string, string> = { HOT: 'bg-red-500', NEW: 'bg-blue-500', BEST_SELLER: 'bg-orange-500', PROMOTION: 'bg-green-500', LIMITED: 'bg-purple-500' };
  const labels: Record<string, string> = { HOT: 'HOT', NEW: 'NEW', BEST_SELLER: 'BEST SELLER', PROMOTION: 'PROMOTION', LIMITED: 'LIMITED' };
  return <span className={`${colors[badge] || 'bg-gray-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase`}>{labels[badge] || badge}</span>;
};

const PromotionBadges = ({ tour }: { tour: InternationalTourItem }) => {
  const isSoldOut = tour.available_seats === 0;
  if (isSoldOut) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tour.promotion_type === 'fire_sale' && (
        <span className="text-[10px] font-bold text-white bg-gradient-to-r from-red-600 to-orange-500 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
          <Flame className="w-2.5 h-2.5" /> โปรไฟไหม้
        </span>
      )}
      {tour.promotion_type === 'normal' && (
        <span className="text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-yellow-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Flame className="w-2.5 h-2.5" /> โปรโมชั่น
        </span>
      )}
      {tour.tour_category === 'premium' && (
        <span className="text-[10px] font-bold text-yellow-900 bg-gradient-to-r from-amber-400 to-yellow-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Crown className="w-2.5 h-2.5" /> พรีเมียม
        </span>
      )}
      {tour.discount_label && (
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
          {tour.discount_label}
        </span>
      )}
    </div>
  );
};

// Tour Card (same component)
function TourCard({ tour, settings }: { tour: InternationalTourItem; settings: InternationalTourSettings }) {
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const visiblePeriods = (tour.periods || []).slice(0, showAllPeriods ? undefined : 10);
  const hasDiscount = tour.discount_adult && tour.discount_adult > 0;
  const hasMorePeriods = (tour.periods?.length || 0) > 10;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full h-56 lg:w-56 lg:h-56 shrink-0 overflow-hidden">
          {tour.cover_image_url ? (
            <Image src={tour.cover_image_url} alt={tour.cover_image_alt || tour.title} fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 224px" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-400" /></div>
          )}
          {tour.badge && <div className="absolute top-2 left-2"><TourBadge badge={tour.badge} /></div>}
          {hasDiscount && tour.max_discount_percent && tour.max_discount_percent > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">ลด {Math.round(tour.max_discount_percent)}%</div>
          )}
        </div>
        <div className="flex-1 p-4 lg:p-5">
          <div className="mb-2">
            <Link href={`/tours/${tour.slug}`} className="text-lg font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2">{tour.title}</Link>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">รหัสทัวร์ {tour.tour_code}</span>
              <PromotionBadges tour={tour} />
              <span>{tour.duration_days} วัน {tour.duration_nights} คืน</span>
              {tour.country && (
                <span className="inline-flex items-center gap-1">
                  {tour.country.iso2 && <img src={`https://flagcdn.com/16x12/${tour.country.iso2}.png`} width={16} height={12} alt="" className="inline-block" />}
                  {tour.country.name_th}
                </span>
              )}
              {settings.show_hotel_star && tour.hotel_star && (
                <span className="inline-flex items-center gap-0.5">โรงแรม: {tour.hotel_star}<Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /></span>
              )}
            </div>
          </div>
          {tour.cities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tour.cities.map(city => (
                <Link key={city.id} href={`/tours/city/${city.slug}`} className="inline-flex items-center gap-0.5 text-xs text-orange-600 bg-orange-50 border border-orange-100 hover:bg-orange-100 rounded-full px-2 py-0.5 transition-colors">
                  <MapPin className="w-2.5 h-2.5" />{city.name_th}
                </Link>
              ))}
            </div>
          )}
          {tour.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{tour.description}</p>}
          {settings.show_transport && tour.transports && tour.transports.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
              {tour.transports.map((t, i) => (
                <div key={i} className="inline-flex items-center gap-2 text-gray-700">
                  {t.airline?.image && <img src={t.airline.image} alt={t.airline.name} className="h-4 object-contain" />}
                  <span className="font-medium">{t.flight_no || t.airline?.code}</span>
                  {t.depart_time && t.arrive_time && <span className="text-green-600 font-mono">{t.depart_time} - {t.arrive_time}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end justify-between mt-2">
            <div className="text-xs text-gray-500">เดินทาง {tour.next_departure_date ? formatDate(tour.next_departure_date) : '-'}</div>
            <div className="text-right">
              <div className="text-xs text-gray-500">ราคาเริ่มต้น</div>
              <div className="flex items-baseline gap-2">
                {hasDiscount && tour.price_adult && <span className="text-sm text-gray-400 line-through">{formatPrice(tour.price_adult)}</span>}
                <span className="text-2xl font-bold text-orange-600">{formatPrice(tour.min_price || tour.display_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {settings.show_periods && tour.periods && tour.periods.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="px-3 py-2 text-left font-medium">เดินทาง</th>
                  <th className="px-3 py-2 text-right font-medium">ราคา</th>
                  <th className="px-3 py-2 text-right font-medium">พักเดี่ยว</th>
                  <th className="px-3 py-2 text-right font-medium">ทารก</th>
                  <th className="px-3 py-2 text-right font-medium">มัดจำ</th>
                  <th className="px-3 py-2 text-center font-medium">ที่นั่ง</th>
                  <th className="px-3 py-2 text-center font-medium">จอง</th>
                  <th className="px-3 py-2 text-center font-medium">รับได้</th>
                  {settings.show_commission && <th className="px-3 py-2 text-right font-medium">คอมมิชชั่น</th>}
                  <th className="px-3 py-2 text-center font-medium">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visiblePeriods.map(period => {
                  const isClosed = period.status === 'closed' || period.available <= 0;
                  return (
                    <tr key={period.id} className={isClosed ? 'bg-gray-50 text-gray-400' : 'hover:bg-orange-50/40'}>
                      <td className="px-3 py-2">
                        <span className={`font-medium ${isClosed ? '' : 'text-gray-900'}`}>{formatDateRange(period.start_date, period.end_date)}</span>
                        <span className="text-gray-400 text-[10px] ml-1">{getDayOfWeek(period.start_date)}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {period.offer ? (
                          <>
                            {period.offer.discount_adult > 0 && <span className="line-through text-gray-300 mr-1">{formatPrice(period.offer.price_adult)}</span>}
                            <span className={`font-bold ${isClosed ? '' : 'text-gray-900'}`}>{formatPrice(period.offer.net_price_adult)}</span>
                          </>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {period.offer ? (
                          <>
                            {period.offer.discount_single > 0 && period.offer.price_single && <span className="line-through text-gray-300 mr-1">{formatPrice(period.offer.price_single)}</span>}
                            <span className={`font-bold ${isClosed ? '' : 'text-gray-900'}`}>{formatPrice(period.offer.net_price_single ?? period.offer.price_single)}</span>
                          </>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right">{period.offer ? formatPrice(period.offer.price_infant) : '-'}</td>
                      <td className="px-3 py-2 text-right">{period.offer ? formatPrice(period.offer.deposit) : '-'}</td>
                      <td className="px-3 py-2 text-center">{period.capacity}</td>
                      <td className="px-3 py-2 text-center">{period.booked}</td>
                      <td className="px-3 py-2 text-center"><PeriodStatusBadge period={period} /></td>
                      {settings.show_commission && <td className="px-3 py-2 text-right text-green-600">{period.offer?.commission_agent || '-'}</td>}
                      <td className="px-3 py-2 text-center">
                        {period.guarantee_status === 'guaranteed' && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">การันตี</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasMorePeriods && (
            <button onClick={() => setShowAllPeriods(!showAllPeriods)} className="w-full py-2 text-xs text-orange-600 hover:bg-orange-50 border-t border-gray-100 flex items-center justify-center gap-1 transition-colors">
              <ChevronDown className={`w-3 h-3 transition-transform ${showAllPeriods ? 'rotate-180' : ''}`} />
              {showAllPeriods ? 'แสดงน้อยลง' : `ดูทั้งหมด ${tour.periods!.length} รอบ`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Country Tours Page =====
export default function CountryToursPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const countrySlug = params.slug as string;

  const [tours, setTours] = useState<InternationalTourItem[]>([]);
  const [filters, setFilters] = useState<InternationalTourFilters>({});
  const [settings, setSettings] = useState<InternationalTourSettings>({
    show_periods: true, max_periods_display: 6, show_transport: true, show_hotel_star: true,
    show_meal_count: true, show_commission: false, filter_country: true, filter_city: true,
    filter_search: true, filter_airline: true, filter_departure_month: true, filter_price_range: true, sort_options: {},
  });
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [countryInfo, setCountryInfo] = useState<{ name_th: string; name_en: string; iso2: string } | null>(null);

  const [selectedCity, setSelectedCity] = useState(searchParams.get('city_id') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedAirline, setSelectedAirline] = useState(searchParams.get('airline_id') || '');
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get('departure_month') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchTours = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const apiParams: Record<string, string | number | undefined> = {
        page,
        country_slug: countrySlug,
        ...(selectedCity && { city_id: selectedCity }),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedAirline && { airline_id: selectedAirline }),
        ...(selectedMonth && { departure_month: selectedMonth }),
        ...(sortBy && { sort_by: sortBy }),
      };
      const response = await internationalToursApi.list(apiParams);
      if (response) {
        setTours(response.data || []);
        setMeta(response.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 });
        setFilters(response.filters || {});
        setSettings(response.settings || settings);
        if (response.active_filters?.country) {
          setCountryInfo(response.active_filters.country);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, selectedCity, searchQuery, selectedAirline, selectedMonth, sortBy]);

  useEffect(() => { fetchTours(currentPage); }, [currentPage, fetchTours]);

  const applyFilters = (page: number = 1) => {
    setCurrentPage(page);
    const p = new URLSearchParams();
    if (selectedCity) p.set('city_id', selectedCity);
    if (searchQuery) p.set('search', searchQuery);
    if (selectedAirline) p.set('airline_id', selectedAirline);
    if (selectedMonth) p.set('departure_month', selectedMonth);
    if (sortBy) p.set('sort_by', sortBy);
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    router.push(`/tours/country/${countrySlug}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const clearFilters = () => {
    setSelectedCity(''); setSearchQuery(''); setSelectedAirline(''); setSelectedMonth(''); setSortBy('');
    setCurrentPage(1);
    router.push(`/tours/country/${countrySlug}`, { scroll: false });
  };

  const hasActiveFilters = selectedCity || searchQuery || selectedAirline || selectedMonth;
  const filteredCities = filters.cities || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="container-custom py-8 lg:py-12">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/tours/international" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {countryInfo?.iso2 && (
              <img src={`https://flagcdn.com/32x24/${countryInfo.iso2}.png`} width={32} height={24} alt="" className="rounded shadow" />
            )}
            <h1 className="text-2xl lg:text-3xl font-bold">
              ทัวร์{countryInfo?.name_th || countrySlug}
            </h1>
          </div>
          <p className="text-white/80 text-sm lg:text-base ml-8">
            รวมโปรแกรมทัวร์{countryInfo?.name_th || ''} ราคาพิเศษ พร้อมเดินทาง
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {settings.filter_search && (
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="ค้นหา โปรแกรมทัวร์" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()} />
              </div>
            )}
            {settings.filter_airline && (
              <div className="flex items-center gap-2 flex-1">
                <Plane className="w-4 h-4 text-gray-400 shrink-0" />
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={selectedAirline} onChange={e => setSelectedAirline(e.target.value)}>
                  <option value="">สายการบิน — ทั้งหมด</option>
                  {(filters.airlines || []).map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                </select>
              </div>
            )}
            {settings.filter_departure_month && (
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                  <option value="">เดือนเดินทาง — ทั้งหมด</option>
                  {(filters.departure_months || []).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 shrink-0">
              {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-500 px-2 py-2">Clear</button>}
              <button onClick={() => applyFilters()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" /> ค้นหา
              </button>
            </div>
          </div>
        </div>

        {/* City pills */}
        {filteredCities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filteredCities.map(city => (
              <button key={city.id} onClick={() => { setSelectedCity(selectedCity === String(city.id) ? '' : String(city.id)); applyFilters(); }}
                className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCity === String(city.id) ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}>
                <MapPin className="w-3 h-3" /> {city.name_th}
              </button>
            ))}
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            {loading ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> กำลังค้นหา...</span> : <><strong className="text-gray-900">{meta.total}</strong> รายการ</>}
          </span>
          <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" value={sortBy} onChange={e => { setSortBy(e.target.value); applyFilters(); }}>
            <option value="">ค่าเริ่มต้น</option>
            {Object.entries(settings.sort_options || {}).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Tour List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="flex flex-col lg:flex-row"><div className="w-full h-56 lg:w-56 lg:h-56 bg-gray-200" /><div className="flex-1 p-5 space-y-3"><div className="h-5 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /><div className="h-4 bg-gray-200 rounded w-full" /></div></div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">ไม่พบรายการทัวร์</h3>
            <p className="text-sm text-gray-500 mb-4">ลองเปลี่ยนเงื่อนไขการค้นหาดูนะครับ</p>
            {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-orange-600 hover:underline">ล้างตัวกรองทั้งหมด</button>}
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map(tour => <TourCard key={tour.id} tour={tour} settings={settings} />)}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); applyFilters(Math.max(1, currentPage - 1)); }} disabled={currentPage <= 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
              .filter(page => { if (meta.last_page <= 7) return true; if (page === 1 || page === meta.last_page) return true; return Math.abs(page - currentPage) <= 2; })
              .reduce((acc: (number | string)[], page, i, arr) => { if (i > 0 && typeof arr[i - 1] === 'number' && (page as number) - (arr[i - 1] as number) > 1) acc.push('...'); acc.push(page); return acc; }, [])
              .map((page, i) => typeof page === 'string'
                ? <span key={`e-${i}`} className="px-2 text-gray-400">...</span>
                : <button key={page} onClick={() => { setCurrentPage(page as number); applyFilters(page as number); }} className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{page}</button>
              )}
            <button onClick={() => { setCurrentPage(Math.min(meta.last_page, currentPage + 1)); applyFilters(Math.min(meta.last_page, currentPage + 1)); }} disabled={currentPage >= meta.last_page} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
