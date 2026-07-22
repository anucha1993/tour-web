'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { tourUrl } from '@/lib/tour-url';

/**
 * Shared "Copy ข้อความ" button used on tour cards (list pages) and the tour
 * detail page. Generates a short marketing text with tour code, title,
 * airlines, departure periods, starting price, and the tour URL, then copies
 * it to the clipboard.
 *
 * Uses a minimal structural `TourLike` shape so it works with all existing
 * tour types (DomesticTourItem, InternationalTourItem, FestivalTourItem,
 * TourDetail, etc.) without coupling to any one of them.
 */

export interface CopyTourLike {
  slug: string;
  country_slug?: string | null;
  city_slug?: string | null;
  tour_code: string;
  title: string;
  transports?: Array<{ airline?: { name?: string | null } | null } | null> | null;
  periods?: Array<{
    start_date: string;
    end_date: string;
    available: number;
    offer?: { net_price_adult?: number | null } | null;
  }> | null;
  min_price?: number | null;
  display_price?: number | null;
}

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatPrice(price: number | null | undefined): string | null {
  if (!price) return null;
  return new Intl.NumberFormat('th-TH').format(price);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = TH_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month}${String(year).slice(-2)}`;
}

function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function buildTourShortText(tour: CopyTourLike, url: string): string {
  const airlineNames =
    tour.transports?.map(t => t?.airline?.name).filter(Boolean).join(', ') || '-';
  const periodLines = (tour.periods || [])
    .map(p => {
      const price = p.offer?.net_price_adult
        ? formatPrice(p.offer.net_price_adult)
        : 'ติดต่อฝ่ายขาย';
      return `${formatDateRange(p.start_date, p.end_date)} | ราคา ${price} | เหลือ ${p.available} ที่นั่ง`;
    })
    .join('\n');
  const startingPrice =
    formatPrice(tour.min_price ?? tour.display_price ?? null) || 'ติดต่อฝ่ายขาย';
  return (
    `รหัสทัวร์: ${tour.tour_code}\n` +
    `${tour.title}\n` +
    `สายการบิน: ${airlineNames}\n\n` +
    `รอบเดินทาง:\n${periodLines}\n\n` +
    `ราคาเริ่มต้น: ${startingPrice} บาท\n\n` +
    `ดูรายละเอียด: ${url}`
  );
}

interface Props {
  tour: CopyTourLike;
  /** Extra classes appended to the default button classes. */
  className?: string;
  /** Slightly larger button (used on the tour detail page header). */
  size?: 'sm' | 'md';
}

export default function CopyTourTextButton({ tour, className, size = 'sm' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    const url = `${window.location.origin}${tourUrl(tour)}`;
    const text = buildTourShortText(tour, url);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses =
    size === 'md' ? 'px-2.5 py-1.5 text-xs sm:text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer flex items-center gap-1 rounded-full font-medium transition-colors ${sizeClasses} ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
      }${className ? ` ${className}` : ''}`}
      title="คัดลอกข้อความสั้น"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'คัดลอกแล้ว!' : 'Copy ข้อความ'}
    </button>
  );
}
