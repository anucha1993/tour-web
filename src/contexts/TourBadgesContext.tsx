'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tourTabsApi, TourTabBadge, festivalToursApi, FestivalBadge } from '@/lib/api';

interface BadgeInfo {
  text: string;
  color: string;
  icon?: string;
}

interface TourBadgesContextType {
  /** Get badges for a specific tour ID */
  getBadges: (tourId: number) => BadgeInfo[];
  /** Get badges for a specific period based on discount amount */
  getPeriodBadges: (tourId: number, discountAdult: number, periodId?: number) => BadgeInfo[];
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
  const [festivalBadges, setFestivalBadges] = useState<FestivalBadge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [tabResponse, festivalResponse] = await Promise.all([
          tourTabsApi.badges(),
          festivalToursApi.badges().catch(() => ({ data: [] })),
        ]);
        setBadgeTabs(tabResponse.data || []);
        setFestivalBadges(festivalResponse.data || []);
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
    // Tour tab badges
    for (const tab of badgeTabs) {
      // Skip period-only badges from card display
      if (tab.display_modes?.length === 1 && tab.display_modes[0] === 'period') continue;
      if (!tab.display_modes?.includes('badge')) continue;
      if (tab.tour_ids.includes(tourId)) {
        badges.push({
          text: tab.badge_text,
          color: tab.badge_color,
          icon: tab.badge_icon || undefined,
        });
      }
    }
    // Festival badges (card mode)
    for (const festival of festivalBadges) {
      if (!festival.badge_text) continue;
      if (!festival.display_modes?.includes('card')) continue;
      if (festival.tour_ids.includes(tourId)) {
        badges.push({
          text: festival.badge_text,
          color: festival.badge_color,
          icon: festival.badge_icon || undefined,
        });
      }
    }
    return badges;
  };

  const getPeriodBadges = (tourId: number, discountAdult: number, periodId?: number): BadgeInfo[] => {
    const badges: BadgeInfo[] = [];
    // Tour tab badges — only show on periods if display_modes includes 'period'
    for (const tab of badgeTabs) {
      if (!tab.display_modes?.includes('period')) continue;
      if (!tab.tour_ids.includes(tourId)) continue;
      // Check discount conditions — if tab requires discount, period must have discount > 0
      if (tab.requires_discount && discountAdult <= 0) continue;
      if (tab.discount_min_amount && tab.discount_min_amount > 0 && discountAdult < tab.discount_min_amount) continue;
      badges.push({
        text: tab.badge_text,
        color: tab.badge_color,
        icon: tab.badge_icon || undefined,
      });
    }
    // Festival badges (period mode only)
    for (const festival of festivalBadges) {
      if (!festival.badge_text) continue;
      if (!festival.display_modes?.includes('period')) continue;
      if (!festival.tour_ids.includes(tourId)) continue;
      // If periodId provided and festival has specific period_ids, check match
      if (periodId && festival.period_ids.length > 0) {
        if (festival.period_ids.includes(periodId)) {
          badges.push({
            text: festival.badge_text,
            color: festival.badge_color,
            icon: festival.badge_icon || undefined,
          });
        }
      } else {
        // No specific period_ids or no periodId — show if tour matches
        badges.push({
          text: festival.badge_text,
          color: festival.badge_color,
          icon: festival.badge_icon || undefined,
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
