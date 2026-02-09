'use client';

import { Heart } from 'lucide-react';
import { useFavorites, FavoriteTourData } from '@/contexts/FavoritesContext';

interface FavoriteButtonProps {
  tour: FavoriteTourData;
  className?: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ tour, className = '', size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(tour.id);

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(tour);
      }}
      className={`cursor-pointer ${sizeClasses} rounded-full flex items-center justify-center transition-all duration-200 ${
        active
          ? 'bg-red-500 text-white shadow-md scale-110'
          : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
      } ${className}`}
      aria-label={active ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
    >
      <Heart className={`${iconSize} ${active ? 'fill-current' : ''}`} />
    </button>
  );
}
