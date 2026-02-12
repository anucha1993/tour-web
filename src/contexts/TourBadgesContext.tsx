'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tourTabsApi, TourTabBadge } from '@/lib/api';

interface BadgeInfo {
  text: string;
  color: string;
  icon?: string;
}

interface TourBadgesContextType {
  /** Get badges for a specific tour ID */
  getBadges: (tourId: number) => BadgeInfo[];
  /** Get badges for a specific period based on discount amount */
  getPeriodBadges: (tourId: number, discountAdult: number) => BadgeInfo[];
  /** Whether badge data is loaded */
  loaded: boolean;
}

const TourBadgesContext = createContext<TourBadgesContextType>({
  getBadges: () => [],
  getPeriodBadges: () => [],
  loaded: false,
});

export function TourBadgesProvider({ children }: { children: ReactNode }) {
  const [badgeTabs, setBadgeTabs] = useState<TourTabBadge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await tourTabsApi.badges();
        setBadgeTabs(response.data || []);
      } catch (error) {
        console.error('Failed to fetch tour badges:', error);
      } finally {
        setLoaded(true);
      }
    };

    fetchBadges();
  }, []);

  const getBadges = (tourId: number): BadgeInfo[] => {
    const badges: BadgeInfo[] = [];
    for (const tab of badgeTabs) {
      // Skip period-only badges from card display
      if (tab.display_mode === 'period') continue;
      if (tab.tour_ids.includes(tourId)) {
        badges.push({
          text: tab.badge_text,
          color: tab.badge_color,
          icon: tab.badge_icon || undefined,
        });
      }
    }
    return badges;
  };

  const getPeriodBadges = (tourId: number, discountAdult: number): BadgeInfo[] => {
    const badges: BadgeInfo[] = [];
    for (const tab of badgeTabs) {
      if (!tab.tour_ids.includes(tourId)) continue;
      // Period-mode or other badges with discount_min_amount condition
      const isPeriodMode = tab.display_mode === 'period';
      const hasCondition = tab.discount_min_amount && tab.discount_min_amount > 0;
      // If has condition, check discount meets threshold
      if (hasCondition) {
        if (discountAdult >= tab.discount_min_amount!) {
          badges.push({
            text: tab.badge_text,
            color: tab.badge_color,
            icon: tab.badge_icon || undefined,
          });
        }
      } else if (isPeriodMode) {
        // Period-mode without condition: always show
        badges.push({
          text: tab.badge_text,
          color: tab.badge_color,
          icon: tab.badge_icon || undefined,
        });
      }
    }
    return badges;
  };

  return (
    <TourBadgesContext.Provider value={{ getBadges, getPeriodBadges, loaded }}>
      {children}
    </TourBadgesContext.Provider>
  );
}

export function useTourBadges() {
  return useContext(TourBadgesContext);
}
