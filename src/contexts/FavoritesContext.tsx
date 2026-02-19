'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api, wishlistApi } from '@/lib/api';

const STORAGE_KEY = 'nexttrip_favorites';
const EXPIRY_DAYS = 7;

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
  added_at?: string; // ISO timestamp — set automatically, optional for callers
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

/** Returns true if an item was added more than EXPIRY_DAYS ago */
function isExpired(addedAt?: string): boolean {
  if (!addedAt) return false; // No timestamp = treat as valid (legacy items)
  const diffMs = Date.now() - new Date(addedAt).getTime();
  return diffMs > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTourData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { member } = useAuth();
  const syncedForMember = useRef<number | null>(null); // tracks which member id was synced

  // Load from localStorage after mount — filter expired items immediately
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter((item): item is FavoriteTourData =>
              typeof item === 'object' && item !== null && typeof item.id === 'number'
            )
            .filter(item => !isExpired(item.added_at));
          setFavorites(valid);
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

  // Sync localStorage → server when member logs in (once per member session)
  useEffect(() => {
    if (!member || !mounted) return;
    if (syncedForMember.current === member.id) return;
    syncedForMember.current = member.id;

    const syncToServer = async () => {
      // Re-read token from localStorage in case ApiClient singleton
      // was instantiated before login (race condition on initial load)
      if (!api.getToken()) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('member_token') : null;
        if (!stored) return; // No token — skip sync silently
        api.setToken(stored);
      }

      try {
        // Fetch current server wishlist IDs
        const response = await wishlistApi.getAll();
        // Skip sync silently if server returns error (expired token, etc.)
        if (!response.success) return;

        const raw = (response as any).data;
        const items: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const serverIds = new Set<number>();
        items.forEach(item => {
          const id = item.tour_id ?? item.id;
          if (typeof id === 'number') serverIds.add(id);
        });

        // Push each local favorite to server if not already there
        for (const fav of favorites) {
          if (!serverIds.has(fav.id)) {
            try { await wishlistApi.toggle(fav.id); } catch { /* ignore */ }
          }
        }
      } catch {
        // Sync failure is non-critical — localStorage is still source of truth
      }
    };

    syncToServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, mounted]);

  // Reset sync tracker on logout
  useEffect(() => {
    if (!member) syncedForMember.current = null;
  }, [member]);

  const isFavorite = useCallback(
    (tourId: number) => favorites.some(f => f.id === tourId),
    [favorites]
  );

  const toggleFavorite = useCallback((tour: FavoriteTourData) => {
    const now = new Date().toISOString();
    setFavorites(prev => {
      const exists = prev.some(f => f.id === tour.id);
      if (exists) {
        return prev.filter(f => f.id !== tour.id);
      }
      return [...prev, { ...tour, added_at: tour.added_at ?? now }];
    });

    // Sync to server if logged in
    if (member) {
      wishlistApi.toggle(tour.id).catch(() => { /* ignore */ });
    }
  }, [member]);

  const removeFavorite = useCallback((tourId: number) => {
    setFavorites(prev => prev.filter(f => f.id !== tourId));

    // Remove from server if logged in
    if (member) {
      wishlistApi.toggle(tourId).catch(() => { /* ignore */ });
    }
  }, [member]);

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
