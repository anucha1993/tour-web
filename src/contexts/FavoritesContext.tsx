'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'nexttrip_favorites';

// Minimal tour data stored alongside the ID for display in favorites drawer
export interface FavoriteTourData {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  price: number | null;
  country_name: string;
  days: number;
  nights: number;
  tour_code?: string;
}

interface FavoritesContextType {
  favorites: FavoriteTourData[];
  isFavorite: (tourId: number) => boolean;
  toggleFavorite: (tour: FavoriteTourData) => void;
  removeFavorite: (tourId: number) => void;
  clearFavorites: () => void;
  count: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTourData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] !== 'number') {
          setFavorites(parsed);
        }
      }
    } catch {
      // Ignore corrupt data
    }
    setMounted(true);
  }, []);

  // Persist to localStorage when favorites change (skip initial empty state)
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch {
        // Storage full or unavailable
      }
    }
  }, [favorites, mounted]);

  const isFavorite = useCallback(
    (tourId: number) => favorites.some(f => f.id === tourId),
    [favorites]
  );

  const toggleFavorite = useCallback((tour: FavoriteTourData) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === tour.id);
      if (exists) {
        return prev.filter(f => f.id !== tour.id);
      }
      return [...prev, tour];
    });
  }, []);

  const removeFavorite = useCallback((tourId: number) => {
    setFavorites(prev => prev.filter(f => f.id !== tourId));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        count: favorites.length,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
