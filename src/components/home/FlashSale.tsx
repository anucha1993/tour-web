'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Clock,
  MapPin,
  Calendar,
  Plane,
  Star,
  Eye,
  Hotel,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { flashSaleApi, FlashSalePublic, FlashSalePublicItem } from '@/lib/api';
import FavoriteButton from './FavoriteButton';

// ─── Countdown Timer ───
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

function CountdownDisplay({ endDate }: { endDate: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(endDate);

  if (expired) {
    return (
      <span className="text-sm text-gray-400 font-medium">หมดเวลาแล้ว</span>
    );
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

// ─── Progress Bar for limited stock ───
function StockProgress({ sold, limit }: { sold: number; limit: number }) {
  const percent = Math.min(100, Math.round((sold / limit) * 100));
  const remaining = Math.max(0, limit - sold);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-red-500 font-semibold">ขายแล้ว {percent}%</span>
        <span className="text-gray-500">เหลือ {remaining} ที่นั่ง</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Flash Sale Tour Card ───
function FlashTourCard({ item }: { item: FlashSalePublicItem }) {
  const flashPrice = Number(item.flash_price);
  const originalPrice = Number(item.original_price_snapshot || item.original_price || 0);
  const discountPercent = Number(item.discount_percent || 0);

  return (
    <Link
      href={`/tours/${item.slug}`}
      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[260px] sm:w-[280px] ${
        item.is_sold_out ? 'opacity-70' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />

        {/* Flash Sale badge */}
        {discountPercent > 0 && !item.is_sold_out && (
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-gradient-to-r from-red-500 to-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            <Zap className="w-3 h-3 fill-white" />
            Flash Sale
          </div>
        )}

        {/* SOLD OUT */}
        {item.is_sold_out && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
            <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transform -rotate-12 shadow-lg">
              SOLD OUT
            </span>
          </div>
        )}

        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              item.is_sold_out ? 'grayscale-[30%]' : ''
            }`}
            sizes="(max-width: 640px) 260px, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Plane className="w-10 h-10" />
          </div>
        )}

        {/* Favorite */}
        {!item.is_sold_out && (
          <div className="absolute top-2 right-2 z-30">
            <FavoriteButton
              tour={{
                id: item.id,
                title: item.title,
                slug: item.slug,
                image_url: item.image_url,
                price: flashPrice,
                country_name: item.country?.name,
                days: item.days,
                nights: item.nights,
                tour_code: item.tour_code,
              }}
              size="sm"
            />
          </div>
        )}

        {/* Country */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 text-white text-xs">
          <MapPin className="w-3.5 h-3.5" />
          {item.country?.name}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-mono text-gray-400">{item.tour_code}</span>
        </div>

        <h3 className="font-semibold text-sm text-gray-800 group-hover:text-red-500 transition-colors line-clamp-2 min-h-[40px]">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {item.days}วัน {item.nights}คืน
          </span>
          {item.airline && (
            <span className="flex items-center gap-0.5">
              <Plane className="w-3 h-3" />
              {item.airline}
            </span>
          )}
        </div>

        {/* Hotel stars */}
        {item.hotel_star && item.hotel_star > 0 && (
          <div className="flex items-center gap-0.5 mt-1 text-xs text-gray-500">
            <Hotel className="w-3 h-3 text-amber-500" />
            {Array.from({ length: item.hotel_star }, (_, i) => (
              <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-500">ราคา Flash Sale</p>
              <div className="flex items-baseline gap-1.5">
                {originalPrice > flashPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ฿{originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-lg font-bold text-red-500">
                  ฿{flashPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-[10px] bg-gray-100 rounded-full px-2 py-0.5">
              <Eye className="w-3 h-3" />
              {item.view_count >= 1000
                ? `${(item.view_count / 1000).toFixed(1)}k`
                : item.view_count}
            </div>
          </div>

          {/* Stock progress */}
          {item.quantity_limit && !item.is_sold_out && (
            <StockProgress sold={item.quantity_sold} limit={item.quantity_limit} />
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main FlashSale Component ───
export default function FlashSale() {
  const [flashSales, setFlashSales] = useState<FlashSalePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await flashSaleApi.getActive();
        const data: FlashSalePublic[] = res.data || [];
        // Only show flash sales that are running and have items
        setFlashSales(data.filter((fs: FlashSalePublic) => fs.is_running && fs.items.length > 0));
      } catch (err) {
        console.error('Error fetching flash sales:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, [scrollContainerRef]);

  useEffect(() => {
    if (!scrollContainerRef) return;
    checkScroll();
    scrollContainerRef.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      scrollContainerRef.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [scrollContainerRef, checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollContainerRef) return;
    const amount = 300;
    scrollContainerRef.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section className="py-10 lg:py-14 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[280px] flex-shrink-0 bg-white rounded-xl overflow-hidden">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-24 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (flashSales.length === 0) return null;

  return (
    <>
      {flashSales.map((sale) => (
        <section
          key={sale.id}
          className="py-10 lg:py-14 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-100/50 to-transparent rounded-full blur-3xl" />

          <div className="container-custom relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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
                  <p className="text-gray-600 text-sm ml-12">
                    {sale.description}
                  </p>
                )}
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600 font-medium">สิ้นสุดใน</span>
                <CountdownDisplay endDate={sale.end_date} />
              </div>
            </div>

            {/* Tour Cards Carousel */}
            <div className="relative">
              {/* Scroll arrows */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {/* Cards */}
              <div
                ref={setScrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
              >
                {sale.items.map((item) => (
                  <FlashTourCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
