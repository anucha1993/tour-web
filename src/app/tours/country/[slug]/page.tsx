'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import {
  internationalToursApi,
  InternationalTourItem,
  InternationalTourFilters,
  InternationalTourSettings,
  InternationalTourPeriod,
} from '@/lib/api';
import TourTabBadges from '@/components/shared/TourTabBadges';
import TourSearchForm, { SearchParams } from '@/components/shared/TourSearchForm';
import { useTourBadges } from '@/contexts/TourBadgesContext';

// Reusable helpers
const formatPrice = (price: number | null | undefined) => {
  if (!price) return null;
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

const formatDepartureMonthRange = (periods: { start_date: string }[]) => {
  if (!periods || periods.length === 0) return '-';
  const thMonthsFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const dates = periods.map(p => new Date(p.start_date)).sort((a, b) => a.getTime() - b.getTime());
  const first = dates[0];
  const last = dates[dates.length - 1];
  const firstMonth = thMonthsFull[first.getMonth()];
  const lastMonth = thMonthsFull[last.getMonth()];
  const firstYear = String(first.getFullYear() + 543).slice(-2);
  const lastYear = String(last.getFullYear() + 543).slice(-2);
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${firstMonth} ${firstYear}`;
  }
  if (first.getFullYear() === last.getFullYear()) {
    return `${firstMonth}-${lastMonth} ${firstYear}`;
  }
  return `${firstMonth} ${firstYear}-${lastMonth} ${lastYear}`;
};
const getDayOfWeek = (dateStr: string) => ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'][new Date(dateStr).getDay()];

const PeriodStatusBadge = ({ period }: { period: InternationalTourPeriod }) => {
  if (period.status === 'closed' || period.available <= 0)
    return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-sm font-bold rounded">CLOSED</span>;
  if (period.available <= 5)
    return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded">{period.available}</span>;
  return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-bold rounded">{period.available}</span>;
};

const TourBadge = ({ badge }: { badge: string }) => {
  const colors: Record<string, string> = { HOT: 'bg-red-500', NEW: 'bg-blue-500', BEST_SELLER: 'bg-orange-500', PROMOTION: 'bg-green-500', LIMITED: 'bg-purple-500' };
  const labels: Record<string, string> = { HOT: 'HOT', NEW: 'NEW', BEST_SELLER: 'BEST SELLER', PROMOTION: 'PROMOTION', LIMITED: 'LIMITED' };
  return <span className={`${colors[badge] || 'bg-gray-500'} text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase`}>{labels[badge] || badge}</span>;
};

const PromotionBadges = ({ tour }: { tour: InternationalTourItem }) => {
  const isSoldOut = tour.available_seats === 0;
  if (isSoldOut) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <TourTabBadges tourId={tour.id} className="text-xs px-2 py-0.5" />
      {tour.discount_label && (
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
          {tour.discount_label}
        </span>
      )}
    </div>
  );
};

const BADGE_BG_CLASSES: Record<string, string> = {
  red: 'bg-gradient-to-r from-red-600 to-orange-500',
  orange: 'bg-gradient-to-r from-orange-500 to-yellow-400',
  yellow: 'bg-gradient-to-r from-amber-400 to-yellow-300 !text-yellow-900',
  green: 'bg-gradient-to-r from-green-500 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-400',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-400',
};

function TourCard({ tour, settings }: { tour: InternationalTourItem; settings: InternationalTourSettings }) {
  const { getPeriodBadges } = useTourBadges();
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const maxDisplay = settings.max_periods_display || 6;
  const visiblePeriods = (tour.periods || []).slice(0, showAllPeriods ? undefined : maxDisplay);
  const hasDiscount = tour.discount_amount && tour.discount_amount > 0;
  const hasMorePeriods = (tour.periods?.length || 0) > maxDisplay;

  return (
    <div className="bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow p-3 lg:p-4">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full aspect-square lg:w-100 lg:h-100 lg:aspect-auto shrink-0 overflow-hidden">
          {tour.cover_image_url ? (
            <Image src={tour.cover_image_url} alt={tour.cover_image_alt || tour.title} fill className="object-cover object-center rounded-2xl lg:rounded-3xl" sizes="(max-width: 1024px) 100vw, 400px" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-400" /></div>
          )}
          {tour.badge && <div className="absolute top-2 left-2"><TourBadge badge={tour.badge} /></div>}
          {hasDiscount && tour.max_discount_percent && tour.max_discount_percent > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-sm font-bold px-2.5 py-1 ">ลด {Math.round(tour.max_discount_percent)}%</div>
          )}
        </div>
        <div className="flex-1 pt-3 lg:p-5">
          <div className="mb-2">
            <Link href={`/tours/${tour.slug}`} className="text-lg lg:text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2">{tour.title}</Link>
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mt-1.5 text-xs lg:text-sm text-gray-500">
              <span className="bg-gray-100 px-2.5 py-0.5 rounded font-mono">รหัสทัวร์ {tour.tour_code}</span>
              <span>{tour.duration_days} วัน {tour.duration_nights} คืน</span>
              {tour.country && (
                <span className="inline-flex items-center gap-1">
                  {tour.country.iso2 && <img src={`https://flagcdn.com/16x12/${tour.country.iso2}.png`} width={16} height={12} alt="" className="inline-block" />}
                  {tour.country.name_th}
                </span>
              )}
              {settings.show_hotel_star && tour.hotel_star && (
                <span className="inline-flex items-center gap-0.5">โรงแรม: {Array.from({ length: tour.hotel_star }, (_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</span>
              )}
              {settings.show_meal_count && tour.meal_count && tour.meal_count.total > 0 && (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  🍽️ {tour.meal_count.breakfast}B {tour.meal_count.lunch}L {tour.meal_count.dinner}D
                </span>
              )}
              <span className="ml-auto"><PromotionBadges tour={tour} /></span>
            </div>
          </div>
          {tour.cities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tour.cities.map(city => (
                <Link key={city.id} href={`/tours/city/${city.slug}`} className="inline-flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm text-orange-600 bg-orange-50 border border-orange-100 hover:bg-orange-100 rounded-full px-2 lg:px-3 py-0.5 lg:py-1 transition-colors">
                  <MapPin className="w-3 lg:w-3.5 h-3 lg:h-3.5" />{city.name_th}
                </Link>
              ))}
            </div>
          )}
          {tour.description && <p className="text-sm lg:text-base text-gray-600 line-clamp-2 mb-2 lg:mb-3">{tour.description}</p>}

          {/* Highlights section */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-orange-500">✦</span>
                <span className="text-sm font-semibold text-gray-700">ไฮไลท์ทัวร์</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tour.highlights.slice(0, 5).map((h, i) => (
                  <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-2.5 py-0.5">{h}</span>
                ))}
              </div>
            </div>
          )}
          {tour.hashtags && tour.hashtags.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1.5">
                {tour.hashtags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="text-xs text-blue-600 bg-blue-50 rounded-full px-2.5 py-0.5">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          {settings.show_transport && tour.transports && tour.transports.length > 0 && (
            <div className="flex items-center justify-between mb-2 lg:mb-3 text-xs lg:text-sm">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                {tour.transports.map((t, i) => (
                  <div key={i} className="inline-flex items-center gap-2 text-gray-700">
                    <span>สายการบิน :  {t.airline?.name}</span>
                    {t.airline?.image && <img src={t.airline.image} alt={t.airline.name} className="h-5 object-contain" />}
                    {t.depart_time && t.arrive_time && <span className="text-green-600 font-mono">{t.depart_time} - {t.arrive_time}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse gap-2 lg:flex-row lg:items-end lg:justify-between mt-2">
             <div className="flex items-center gap-2">
              {tour.pdf_url && (
                <a
                  href={tour.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs lg:text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-2.5 lg:px-3 py-1.5 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  PDF
                </a>
              )}
              <Link
                href={`/tours/${tour.slug}`}
                className="inline-flex items-center gap-1.5 text-xs lg:text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-2.5 lg:px-3 py-1.5 font-medium transition-colors"
              >
                ดูรายละเอียดทัวร์
              </Link>
            </div>
            
            <div className="text-right">
              <div className="text-xs lg:text-sm text-gray-500">ราคาเริ่มต้น</div>
              {hasDiscount && tour.price_adult && <div className="text-sm lg:text-base text-gray-400 line-through">{formatPrice(tour.price_adult)}</div>}
              <span className={`text-2xl lg:text-3xl font-bold ${hasDiscount ? 'text-red-600' : 'text-orange-600'}`}>
                {hasDiscount && tour.price_adult && tour.discount_amount
                  ? formatPrice(tour.price_adult - tour.discount_amount)
                  : formatPrice(tour.min_price || tour.display_price) || <span className="text-sm lg:text-base text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>}
              </span>
              <div className="text-xs lg:text-sm">เดินทาง {tour.periods && tour.periods.length > 0 ? formatDepartureMonthRange(tour.periods) : '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex items-center gap-1 justify-end px-2 lg:px-4 pt-1 mt-0 lg:mt-[-20px]">
        <span className="text-xs text-gray-400 mr-0.5">แชร์</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tours/${tour.slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className=" cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          title="แชร์ Facebook"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a
          href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tours/${tour.slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
          title="แชร์ LINE"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tours/${tour.slug}`)}&text=${encodeURIComponent(tour.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
          title="แชร์ X"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <button
          onClick={(e) => {
            e.preventDefault();
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

      {settings.show_periods && tour.periods && tour.periods.length > 0 && (
        <div className="border-t border-gray-100 mt-1">
          <div className="overflow-x-auto">
            <table className="w-full text-xs lg:text-base text-center">
              <thead>
                <tr className="text-white font-semibold bg-orange-400">
                  <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium rounded-tl-lg whitespace-nowrap">เดินทาง</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium whitespace-nowrap">ผู้ใหญ่ (พัก2-3ท่าน)</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium whitespace-nowrap">ผู้ใหญ่ (พักเดี่ยว)</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium">ที่นั่ง</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium">จอง</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium rounded-tr-lg">รับได้</th>
                  {settings.show_commission && <th className="px-2 lg:px-4 py-2 lg:py-2.5 text-center font-medium rounded-tr-lg">คอมมิชชั่น</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visiblePeriods.map(period => {
                  const isClosed = period.status === 'closed' || period.available <= 0;
                  return (
                    <tr key={period.id} className={isClosed ? 'bg-gray-50 text-gray-400' : 'hover:bg-orange-50/40'}>
                      <td className="px-2 lg:px-4 py-2 lg:py-2.5">
                        <div className="flex items-center gap-1 lg:gap-1.5 whitespace-nowrap">
                          <span className={`font-medium ${isClosed ? '' : 'text-gray-500'}`}>{formatDateRange(period.start_date, period.end_date)}</span>
                          <span className="text-gray-500 text-xs">{getDayOfWeek(period.start_date)}</span>
                          {(() => {
                            const pBadges = getPeriodBadges(tour.id, period.offer?.discount_adult || 0, period.id);
                            return pBadges.map((b, bi) => (
                              <span key={bi} className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${BADGE_BG_CLASSES[b.color] || 'bg-gray-500'} ${b.color === 'yellow' ? 'text-yellow-900' : ''}`}>
                                {b.icon && <span>{b.icon}</span>}{b.text}
                              </span>
                            ));
                          })()}
                        </div>
                      </td>
                      {/* ผู้ใหญ่ (พัก2-3ท่าน) */}
                      <td className="px-2 lg:px-4 py-2 lg:py-2.5 text-center whitespace-nowrap">
                        {period.offer ? (
                          period.offer.net_price_adult ? (
                            <div>
                              {period.offer.discount_adult > 0 && <div className="line-through text-gray-400 text-sm">{formatPrice(period.offer.price_adult)}</div>}
                              <span className={`font-bold ${period.offer.discount_adult > 0 ? 'text-red-600' : isClosed ? '' : 'text-gray-500'}`}>{formatPrice(period.offer.net_price_adult)}</span>
                            </div>
                          ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>
                        ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>}
                      </td>
                       {/* ผู้ใหญ่ (พักเดี่ยว) */}
                      <td className="px-2 lg:px-4 py-2 lg:py-2.5 text-center whitespace-nowrap">
                        {period.offer ? (
                          (period.offer.net_price_single ?? period.offer.price_single) ? (
                            <div>
                              {period.offer.discount_single > 0 && period.offer.price_single && <div className="line-through text-gray-400 text-sm">{formatPrice(period.offer.price_single)}</div>}
                              <span className={`font-bold ${period.offer.discount_single > 0 ? 'text-red-600' : isClosed ? '' : 'text-gray-500'}`}>{formatPrice(period.offer.net_price_single ?? period.offer.price_single)}</span>
                            </div>
                          ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>
                        ) : <span className="text-xs text-orange-500 font-medium">ติดต่อฝ่ายขาย</span>}
                      </td>
                      <td className="px-2 lg:px-4 py-2 lg:py-2.5 text-center">{period.capacity}</td>
                      <td className="px-2 lg:px-4 py-2 lg:py-2.5 text-center">{period.booked}</td>
                      <td className="px-2 lg:px-4 py-2 lg:py-2.5 text-center"><PeriodStatusBadge period={period} /></td>
                      {settings.show_commission && <td className="px-2 lg:px-4 py-2 lg:py-2.5 text-center text-green-600">{period.offer?.commission_agent || '-'}</td>}
                     
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasMorePeriods && (
            <button onClick={() => setShowAllPeriods(!showAllPeriods)} className="w-full py-2.5 text-sm text-orange-600 hover:bg-orange-50 border-t border-gray-100 flex items-center justify-center gap-1 transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllPeriods ? 'rotate-180' : ''}`} />
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
  const [countryInfo, setCountryInfo] = useState<{ id: number; name_th: string; name_en: string; iso2: string } | null>(null);

  const [activeSearchParams, setActiveSearchParams] = useState<SearchParams>({
    search: searchParams.get('search') || undefined,
    city_id: searchParams.get('city_id') || undefined,
    airline_id: searchParams.get('airline_id') || undefined,
    departure_date_from: searchParams.get('departure_date_from') || undefined,
    departure_date_to: searchParams.get('departure_date_to') || undefined,
    departure_month: searchParams.get('departure_month') || undefined,
    return_date: searchParams.get('return_date') || undefined,
    price_min: searchParams.get('price_min') || undefined,
    price_max: searchParams.get('price_max') || undefined,
    min_seats: searchParams.get('min_seats') || undefined,
    festival_id: searchParams.get('festival_id') || undefined,
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTours = useCallback(async (page: number = 1) => {
    // ยกเลิก request ก่อนหน้าที่ยังไม่เสร็จ
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const apiParams: Record<string, string | number | undefined> = {
        page,
        country_slug: countrySlug,
        ...activeSearchParams,
        ...(sortBy && { sort_by: sortBy }),
      };
      const response = await internationalToursApi.list(apiParams);
      if (controller.signal.aborted) return;
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
      if (controller.signal.aborted) return;
      console.error('Failed to fetch tours:', error);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, activeSearchParams, sortBy]);

  useEffect(() => {
    fetchTours(currentPage);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [currentPage, fetchTours]);

  const handleSearch = (params: SearchParams) => {
    setActiveSearchParams(params);
    setCurrentPage(1);
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
    if (sortBy) p.set('sort_by', sortBy);
    const qs = p.toString();
    router.push(`/tours/country/${countrySlug}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const clearFilters = () => {
    setActiveSearchParams({});
    setSortBy('');
    setCurrentPage(1);
    router.push(`/tours/country/${countrySlug}`, { scroll: false });
  };

  const isInitialLoad = loading && tours.length === 0 && !countryInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white overflow-hidden">
        {settings.cover_image_url && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${settings.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: settings.cover_image_position || 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
          </>
        )}
        <div className={`container-custom relative z-10  ${settings.cover_image_url ? 'pt-14 pb-28 lg:pt-30 lg:pb-40' : 'pt-8 pb-28 lg:pt-12 lg:pb-36'}`}>
          {isInitialLoad ? (
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 bg-white/30 rounded" />
                <div className="w-8 h-6 bg-white/30 rounded" />
                <div className="h-9 lg:h-10 bg-white/30 rounded-lg w-48 lg:w-64" />
              </div>
              <div className="ml-8 h-5 bg-white/20 rounded w-60 lg:w-80" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/tours/international" className="text-white/70 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                {countryInfo?.iso2 && (
                  <img src={`https://flagcdn.com/32x24/${countryInfo.iso2.toLowerCase()}.png`} width={32} height={24} alt="" className="rounded shadow" />
                )}
                <h1 className="text-3xl lg:text-4xl font-bold">
                  ทัวร์{countryInfo?.name_th || countrySlug}
                </h1>
              </div>
              <p className="text-white/80 text-base lg:text-lg ml-8">
                รวมโปรแกรมทัวร์{countryInfo?.name_th || ''} ราคาพิเศษ พร้อมเดินทาง
              </p>
            </>
          )}
        </div>
      </div>

      <div className="container-custom py-6">
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
              initialValues={{
                ...activeSearchParams,
                ...(countryInfo?.id ? { country_id: String(countryInfo.id) } : {}),
              }}
              showFilters={{
                search: settings.filter_search,
                country: settings.filter_country,
                city: settings.filter_city,
                airline: settings.filter_airline,
                departureMonth: settings.filter_departure_month,
                priceRange: settings.filter_price_range,
              }}
            />
          )}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base text-gray-600">
            {loading ? <span className="flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> กำลังค้นหา...</span> : <><strong className="text-gray-900">{meta.total}</strong> รายการ</>}
          </span>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-base" value={sortBy} onChange={e => setSortBy(e.target.value)}>
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
            <h3 className="text-xl font-semibold text-gray-700 mb-1">ไม่พบรายการทัวร์</h3>
            <p className="text-base text-gray-500 mb-4">ลองเปลี่ยนเงื่อนไขการค้นหาดูนะครับ</p>
            <button onClick={clearFilters} className="text-base text-orange-600 hover:underline">ล้างตัวกรองทั้งหมด</button>
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map(tour => <TourCard key={tour.id} tour={tour} settings={settings} />)}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
              .filter(page => { if (meta.last_page <= 7) return true; if (page === 1 || page === meta.last_page) return true; return Math.abs(page - currentPage) <= 2; })
              .reduce((acc: (number | string)[], page, i, arr) => { if (i > 0 && typeof arr[i - 1] === 'number' && (page as number) - (arr[i - 1] as number) > 1) acc.push('...'); acc.push(page); return acc; }, [])
              .map((page, i) => typeof page === 'string'
                ? <span key={`e-${i}`} className="px-2 text-gray-400">...</span>
                : <button key={page} onClick={() => setCurrentPage(page as number)} className={`w-11 h-11 rounded-lg text-base font-medium ${currentPage === page ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{page}</button>
              )}
            <button onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))} disabled={currentPage >= meta.last_page} className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
