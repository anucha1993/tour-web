'use client';

/**
 * Cookie Consent (PDPA) — central state for tracking consent.
 *
 * Categories:
 *  - necessary : always on (cannot be disabled)
 *  - analytics : GA4 / Google Tag
 *  - marketing : Meta Pixel / TikTok / remarketing
 *
 * The user's choice is persisted in localStorage so the banner does not
 * reappear on every visit. Analytics/marketing scripts (see <Analytics />)
 * must NOT load until the matching category is granted.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'nexttrip_cookie_consent';
// Bump this when the cookie policy materially changes to re-prompt users.
const CONSENT_VERSION = 1;

export interface ConsentPreferences {
  necessary: true; // always granted
  analytics: boolean;
  marketing: boolean;
}

interface StoredConsent {
  version: number;
  preferences: ConsentPreferences;
  updatedAt: string;
}

interface ConsentContextType {
  /** true once we've read localStorage on the client (avoids hydration flash) */
  ready: boolean;
  /** true when the user has made an explicit choice (banner should stay hidden) */
  hasDecided: boolean;
  preferences: ConsentPreferences;
  /** convenience flags */
  analyticsAllowed: boolean;
  marketingAllowed: boolean;
  /** whether the settings modal is open */
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Partial<Omit<ConsentPreferences, 'necessary'>>) => void;
}

const DEFAULT_PREFS: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

function readStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed || parsed.version !== CONSENT_VERSION || typeof parsed.preferences !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasDecided, setHasDecided] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_PREFS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load persisted consent after mount.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setPreferences({ ...DEFAULT_PREFS, ...stored.preferences, necessary: true });
      setHasDecided(true);
    }
    setReady(true);
  }, []);

  const persist = useCallback((prefs: ConsentPreferences) => {
    const payload: StoredConsent = {
      version: CONSENT_VERSION,
      preferences: prefs,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage may be unavailable (private mode) — degrade gracefully.
    }
    setPreferences(prefs);
    setHasDecided(true);
    // Let non-React listeners (e.g. Analytics guards) react immediately.
    window.dispatchEvent(new CustomEvent('nexttrip:consent-change', { detail: prefs }));
  }, []);

  const acceptAll = useCallback(() => {
    persist({ necessary: true, analytics: true, marketing: true });
    setSettingsOpen(false);
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({ necessary: true, analytics: false, marketing: false });
    setSettingsOpen(false);
  }, [persist]);

  const savePreferences = useCallback(
    (prefs: Partial<Omit<ConsentPreferences, 'necessary'>>) => {
      persist({
        necessary: true,
        analytics: prefs.analytics ?? preferences.analytics,
        marketing: prefs.marketing ?? preferences.marketing,
      });
      setSettingsOpen(false);
    },
    [persist, preferences.analytics, preferences.marketing]
  );

  const value: ConsentContextType = {
    ready,
    hasDecided,
    preferences,
    analyticsAllowed: hasDecided && preferences.analytics,
    marketingAllowed: hasDecided && preferences.marketing,
    settingsOpen,
    openSettings: () => setSettingsOpen(true),
    closeSettings: () => setSettingsOpen(false),
    acceptAll,
    rejectAll,
    savePreferences,
  };

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextType {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return ctx;
}
