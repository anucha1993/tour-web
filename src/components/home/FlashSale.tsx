'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Clock,
  Calendar,
  Plane,
  ExternalLink,
  ShoppingCart,
} from 'lucide-react';
import { flashSaleApi, FlashSalePublic, FlashSalePublicItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import FlashSaleBookingModal from './FlashSaleBookingModal';

// ─── Countdown Timer Hook ───
function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

// ─── Header Countdown Display ───
function CountdownDisplay({ endDate }: { endDate: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(endDate);

  if (expired) {
    return <span className="text-sm text-gray-400 font-medium">หมดเวลาแล้ว</span>;
  }

  const blocks = [
    { label: 'วัน', value: days },
    { label: 'ชม.', value: hours },
    { label: 'นาที', value: minutes },
    { label: 'วินาที', value: seconds },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-1.5">
          <div className="bg-gray-900 text-white rounded-lg px-2 py-1 min-w-[40px] text-center">
            <span className="text-lg font-bold font-mono leading-none">
              {String(b.value).padStart(2, '0')}
            </span>
            <p className="text-[9px] text-gray-400 leading-none mt-0.5">{b.label}</p>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-gray-400 font-bold text-lg">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Per-row compact countdown ───
function RowCountdown({ endDate }: { endDate: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(endDate);

  if (expired) {
    return <span className="text-xs text-gray-400">หมดเวลา</span>;
  }

  return (
    <span className="text-xs text-red-500 font-mono font-semibold whitespace-nowrap">
      {days > 0 && <span>{days}d </span>}
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

// ─── Stock bar (compact) ───
function StockBar({ sold, limit }: { sold: number; limit: number }) {
  const percent = Math.min(100, Math.round((sold / limit) * 100));
  const remaining = Math.max(0, limit - sold);

  return (
    <div className="w-full min-w-[80px]">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-red-500 font-semibold">{percent}%</span>
        <span className="text-gray-400">เหลือ {remaining}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Format date to Thai short ───
function formatDateThai(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

// ─── Table Row ───
function FlashRow({ item, index, onBook }: { item: FlashSalePublicItem; index: number; onBook: (item: FlashSalePublicItem) => void }) {
  const router = useRouter();
  const flashPrice = Number(item.flash_price);
  const originalPrice = Number(item.original_price_snapshot || item.original_price || 0);
  const discountPercent = Number(item.discount_percent || 0);

  return (
    <tr
      className={`group ${item.is_sold_out ? 'opacity-60' : ''}`}
    >
      {/* Row number */}
      <td className="px-2 py-2.5 text-center text-xs text-gray-400 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors">
        {index + 1}
      </td>

      {/* Tour: Image + Title + Code — clickable to tour detail */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/tours/${item.slug}`)}>
        <div className="flex items-center gap-2.5">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Plane className="w-5 h-5" />
              </div>
            )}
            {item.is_sold_out && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">SOLD</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-red-500 transition-colors line-clamp-1">
              {item.title}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
              <span className="font-mono">{item.tour_code}</span>
              <span className="flex items-center gap-0.5">
                <Calendar className="w-3 h-3" />
                {item.days}D{item.nights}N
              </span>
              {item.country?.name && (
                <span>{item.country.name}</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Period dates */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors hidden sm:table-cell">
        <div className="text-xs text-gray-600 whitespace-nowrap">
          {formatDateThai(item.period_start_date)}
        </div>
        <div className="text-[10px] text-gray-400 whitespace-nowrap">
          ถึง {formatDateThai(item.period_end_date)}
        </div>
      </td>

      {/* Original price */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors text-right hidden md:table-cell">
        {originalPrice > flashPrice ? (
          <span className="text-xs text-gray-400 line-through whitespace-nowrap">
            ฿{originalPrice.toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>

      {/* Flash price */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors text-right">
        <span className="text-sm font-bold text-red-500 whitespace-nowrap">
          ฿{flashPrice.toLocaleString()}
        </span>
      </td>

      {/* Discount */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors text-center hidden sm:table-cell">
        {discountPercent > 0 ? (
          <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3 fill-white" />
            -{discountPercent}%
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>

      {/* Countdown */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors text-center hidden lg:table-cell">
        {item.flash_end_date && !item.is_sold_out ? (
          <RowCountdown endDate={item.flash_end_date} />
        ) : item.is_sold_out ? (
          <span className="text-[11px] text-red-600 font-semibold">SOLD OUT</span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>

      {/* Stock */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors hidden lg:table-cell">
        {item.quantity_limit && !item.is_sold_out ? (
          <StockBar sold={item.quantity_sold} limit={item.quantity_limit} />
        ) : item.is_sold_out ? (
          <span className="text-[10px] text-gray-400">-</span>
        ) : (
          <span className="text-[10px] text-gray-400">ไม่จำกัด</span>
        )}
      </td>

      {/* Action */}
      <td className="px-2 py-2.5 border-b border-gray-100 group-hover:bg-orange-50/50 transition-colors text-center">
        {item.is_sold_out ? (
          <span className="text-[10px] text-gray-400 font-semibold">SOLD OUT</span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onBook(item); }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full hover:from-red-600 hover:to-orange-600 transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <ShoppingCart className="w-3 h-3" />
            จองเลย
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Mobile Card Row (stacked layout for small screens) ───
function MobileFlashRow({ item, index, onBook }: { item: FlashSalePublicItem; index: number; onBook: (item: FlashSalePublicItem) => void }) {
  const flashPrice = Number(item.flash_price);
  const originalPrice = Number(item.original_price_snapshot || item.original_price || 0);
  const discountPercent = Number(item.discount_percent || 0);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 border-b border-gray-100 ${
        item.is_sold_out ? 'opacity-60' : ''
      }`}
    >
      {/* Index */}
      <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{index + 1}</span>

      {/* Thumbnail — link to tour */}
      <Link href={`/tours/${item.slug}`} className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Plane className="w-5 h-5" />
          </div>
        )}
        {item.is_sold_out && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">SOLD</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <Link href={`/tours/${item.slug}`} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
          <span className="font-mono">{item.tour_code}</span>
          <span>·</span>
          <span>{formatDateThai(item.period_start_date)}</span>
        </div>
        {item.flash_end_date && !item.is_sold_out && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-red-500">
            <Clock className="w-3 h-3" />
            <RowCountdown endDate={item.flash_end_date} />
          </div>
        )}
      </Link>

      {/* Price + Book button */}
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        {discountPercent > 0 && (
          <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
        {originalPrice > flashPrice && (
          <p className="text-[10px] text-gray-400 line-through">฿{originalPrice.toLocaleString()}</p>
        )}
        <p className="text-sm font-bold text-red-500">฿{flashPrice.toLocaleString()}</p>
        {!item.is_sold_out && (
          <button
            onClick={() => onBook(item)}
            className="mt-0.5 inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full hover:from-red-600 hover:to-orange-600 transition cursor-pointer"
          >
            <ShoppingCart className="w-2.5 h-2.5" />
            จองเลย
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main FlashSale Component ───
export default function FlashSale() {
  const [flashSales, setFlashSales] = useState<FlashSalePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingItem, setBookingItem] = useState<FlashSalePublicItem | null>(null);
  const [bookingSaleItems, setBookingSaleItems] = useState<FlashSalePublicItem[]>([]);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await flashSaleApi.getActive();
        const data: FlashSalePublic[] = res.data || [];
        setFlashSales(data.filter((fs: FlashSalePublic) => fs.is_running && fs.items.length > 0));
      } catch (err) {
        console.error('Error fetching flash sales:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auth gate: if not logged in → redirect to login with return URL
  const handleBook = (item: FlashSalePublicItem, saleItems: FlashSalePublicItem[]) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}&flash_booking=1`);
      return;
    }
    setBookingItem(item);
    setBookingSaleItems(saleItems);
  };

  // Don't render anything if no flash sales - no skeleton needed since this is below fold
  if (!loading && flashSales.length === 0) return null;

  // Show compact skeleton while loading
  if (loading) {
    return null;
  }

  return (
    <>
      {flashSales.map((sale) => (
        <section
          key={sale.id}
          className="py-10 lg:py-14 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 relative z-0 overflow-hidden"
        >
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-100/50 to-transparent rounded-full blur-3xl" />

          <div className="container-custom relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Zap className="w-6 h-6 text-white fill-white" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {sale.title}
                  </h2>
                </div>
                {sale.description && (
                  <p className="text-gray-600 text-sm ml-12">{sale.description}</p>
                )}
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600 font-medium">สิ้นสุดใน</span>
                <CountdownDisplay endDate={sale.end_date} />
              </div>
            </div>

            {/* ════ Desktop Table ════ */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100/80 backdrop-blur-sm z-10">
                    <tr className="text-[11px] text-gray-500 uppercase tracking-wider">
                      <th className="px-2 py-3 text-center w-8">#</th>
                      <th className="px-2 py-3 text-left">ทัวร์</th>
                      <th className="px-2 py-3 text-left hidden sm:table-cell">วันเดินทาง</th>
                      <th className="px-2 py-3 text-right hidden md:table-cell">ราคาเดิม</th>
                      <th className="px-2 py-3 text-right">ราคา Flash</th>
                      <th className="px-2 py-3 text-center hidden sm:table-cell">ส่วนลด</th>
                      <th className="px-2 py-3 text-center hidden lg:table-cell">นับถอยหลัง</th>
                      <th className="px-2 py-3 text-center hidden lg:table-cell w-[100px]">สถานะ</th>
                      <th className="px-2 py-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, idx) => (
                      <FlashRow key={`${item.id}-${item.period_start_date}`} item={item} index={idx} onBook={(i) => handleBook(i, sale.items)} />
                    ))}
                  </tbody>
                </table>
              </div>
              {sale.items.length > 10 && (
                <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50/50">
                  เลื่อนลงเพื่อดูเพิ่มเติม ({sale.items.length} รายการ)
                </div>
              )}
            </div>

            {/* ════ Mobile List ════ */}
            <div className="sm:hidden bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="max-h-[480px] overflow-y-auto">
                {sale.items.map((item, idx) => (
                  <MobileFlashRow key={`${item.id}-${item.period_start_date}`} item={item} index={idx} onBook={(i) => handleBook(i, sale.items)} />
                ))}
              </div>
              {sale.items.length > 10 && (
                <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50/50">
                  เลื่อนลงเพื่อดูเพิ่มเติม ({sale.items.length} รายการ)
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Flash Sale Booking Modal */}
      {bookingItem && (
        <FlashSaleBookingModal
          item={bookingItem}
          allItems={bookingSaleItems}
          isOpen={!!bookingItem}
          onClose={() => { setBookingItem(null); setBookingSaleItems([]); }}
        />
      )}
    </>
  );
}
