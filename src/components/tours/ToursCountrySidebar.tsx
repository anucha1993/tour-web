'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Calendar, Plane, ArrowRight, Loader2 } from 'lucide-react';
import { internationalToursApi, InternationalTourItem } from '@/lib/api';

interface ToursCountrySidebarProps {
  countryId: number | null;
  countryName: string;
  /** city ids of the current tour, used to rank same-city tours higher */
  cityIds: number[];
  /** current tour id to exclude from the list */
  currentTourId: number;
  /** optional title override */
  title?: string;
}

function SidebarTourCard({ tour }: { tour: InternationalTourItem }) {
  const price = Number(tour.display_price ?? tour.min_price ?? tour.price_adult ?? 0);
  const discountPercent = Number(tour.max_discount_percent || 0);
  const originalPrice = discountPercent > 0 && tour.discount_amount
    ? price + Number(tour.discount_amount)
    : null;
  const isSoldOut = tour.available_seats === 0;

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block rounded-xl overflow-hidden hover:bg-orange-50/60 transition-colors"
    >
      {/* Image on top */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        {tour.cover_image_url ? (
          <Image
            src={tour.cover_image_url}
            alt={tour.cover_image_alt || tour.title}
            fill
            className={`object-contain group-hover:scale-105 transition-transform duration-300 ${isSoldOut ? 'grayscale-[40%]' : ''}`}
            sizes="270px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Plane className="w-8 h-8" />
          </div>
        )}
        {discountPercent > 0 && !isSoldOut && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-wide">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Info below */}
      <div className="px-2.5 pt-2 pb-3">
        <h4 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2rem]">
          {tour.title}
        </h4>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500">
          {tour.country?.name_th && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {tour.country.name_th}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {tour.duration_days}D{tour.duration_nights}N
          </span>
          {tour.next_departure_date && (
            <span className="inline-flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {new Date(tour.next_departure_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-1.5">
          {originalPrice ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-gray-500 line-through">฿{originalPrice.toLocaleString()}</span>
              <span className="text-base font-bold text-red-500">฿{price.toLocaleString()}</span>
            </div>
          ) : (
            <span className="text-base font-bold text-[var(--color-primary)]">฿{price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ToursCountrySidebar({
  countryId,
  countryName,
  cityIds,
  currentTourId,
  title,
}: ToursCountrySidebarProps) {
  const [tours, setTours] = useState<InternationalTourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [settingTitle, setSettingTitle] = useState<string | null>(null);
  const [limit, setLimit] = useState(8);
  const [sortMode, setSortMode] = useState<'same_city' | 'popular' | 'price_asc' | 'latest'>('same_city');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load admin settings (detail-page country sidebar)
  useEffect(() => {
    let active = true;
    internationalToursApi
      .getSettings()
      .then((res) => {
        if (!active) return;
        const s = res?.data;
        if (s) {
          setEnabled(s.detail_country_sidebar_enabled ?? true);
          setSettingTitle(s.detail_country_sidebar_title ?? null);
          setLimit(s.detail_country_sidebar_limit ?? 8);
          setSortMode(s.detail_country_sidebar_sort ?? 'same_city');
        }
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => {
        if (active) setSettingsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!countryId || !enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const apiSort =
      sortMode === 'price_asc' ? 'price_asc' : sortMode === 'latest' ? 'newest' : 'popular';
    internationalToursApi
      .list({ country_id: countryId, per_page: 20, sort_by: apiSort })
      .then((res) => {
        if (!active) return;
        setTours(res?.data || []);
      })
      .catch(() => {
        if (active) setTours([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [countryId, enabled, sortMode]);

  // Exclude current tour. For same_city mode, rank tours sharing cities higher.
  const rankedTours = useMemo(() => {
    const filtered = tours.filter((t) => t.id !== currentTourId);
    if (sortMode === 'same_city') {
      const citySet = new Set(cityIds);
      return filtered
        .map((t) => {
          const overlap = (t.cities || []).reduce(
            (acc, c) => acc + (citySet.has(c.id) ? 1 : 0),
            0
          );
          return { tour: t, overlap };
        })
        .sort((a, b) => b.overlap - a.overlap)
        .map((x) => x.tour)
        .slice(0, limit);
    }
    return filtered.slice(0, limit);
  }, [tours, cityIds, currentTourId, sortMode, limit]);

  // Hide entirely if disabled or nothing to show
  if (!enabled) return null;
  if (settingsLoaded && !loading && rankedTours.length === 0) return null;

  const heading = title || settingTitle || `ทัวร์${countryName ? countryName : 'อื่น'}ที่น่าสนใจ`;

  return (
    <aside className="hidden xl:block w-[270px] flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              {heading}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">โปรแกรมทัวร์เส้นทางเดียวกันที่คุณอาจสนใจ</p>
          </div>

          {/* List */}
          <div className="max-h-[1140px] overflow-y-auto divide-y divide-gray-50 p-1.5 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
              </div>
            ) : (
              rankedTours.map((tour) => <SidebarTourCard key={tour.id} tour={tour} />)
            )}
          </div>

          {/* Footer */}
          {countryId && (
            <div className="px-4 py-3 border-t border-gray-100">
              <Link
                href={`/tours/international?country_id=${countryId}`}
                className="text-xs font-medium text-orange-500 hover:text-orange-600 flex items-center justify-center gap-1 transition-colors"
              >
                ดูทัวร์{countryName}ทั้งหมด
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
