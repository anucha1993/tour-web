'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, MapPin, Calendar, Trash2, ShoppingBag } from 'lucide-react';
import { useFavorites, FavoriteTourData } from '@/contexts/FavoritesContext';

function FavoriteItem({ tour, onRemove }: { tour: FavoriteTourData; onRemove: (id: number) => void }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
      {/* Thumbnail */}
      <Link href={`/tours/${tour.slug}`} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        {tour.image_url ? (
          <Image
            src={tour.image_url}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-300" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/tours/${tour.slug}`} className="block">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors leading-tight">
            {tour.title}
          </h4>
        </Link>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {tour.country_name}
          </span>
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {tour.days}วัน {tour.nights}คืน
          </span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {tour.price ? (
            <span className="text-sm font-bold text-[var(--color-primary)]">
              ฿{tour.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-gray-400">สอบถามราคา</span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(tour.id);
            }}
            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            aria-label="ลบออกจากรายการโปรด"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FavoritesDrawer() {
  const { favorites, removeFavorite, clearFavorites, count, isDrawerOpen, closeDrawer } = useFavorites();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-gray-900">รายการโปรด</h2>
            {count > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {count === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีรายการโปรด</h3>
            <p className="text-sm text-gray-400 mb-6">
              กดไอคอน <Heart className="w-4 h-4 inline text-red-400" /> บนทัวร์ที่สนใจ<br />
              เพื่อบันทึกไว้ดูภายหลัง
            </p>
            <button
              onClick={closeDrawer}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              ดูทัวร์ทั้งหมด
            </button>
          </div>
        ) : (
          <>
            {/* Favorites list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {favorites.map((tour) => (
                <FavoriteItem key={tour.id} tour={tour} onRemove={removeFavorite} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-3">
              <Link
                href="/tours"
                onClick={closeDrawer}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="w-4 h-4" />
                ดูทัวร์ทั้งหมด
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('ต้องการล้างรายการโปรดทั้งหมดหรือไม่?')) {
                    clearFavorites();
                  }
                }}
                className="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                ล้างรายการทั้งหมด
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
