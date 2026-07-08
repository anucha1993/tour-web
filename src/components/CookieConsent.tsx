'use client';

/**
 * Cookie Consent Banner (PDPA).
 *
 * Shows on first visit until the user makes a choice. Offers:
 *   - ยอมรับทั้งหมด (Accept all)
 *   - ปฏิเสธ (Reject non-essential)
 *   - ตั้งค่า (Open the settings modal to toggle categories)
 *
 * The choice gates GA4 / Meta Pixel loading via <Analytics /> + ConsentContext.
 * Brand tone: orange (var(--color-primary)).
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { useConsent } from '@/contexts/ConsentContext';

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function CookieConsent() {
  const {
    ready,
    hasDecided,
    preferences,
    settingsOpen,
    openSettings,
    closeSettings,
    acceptAll,
    rejectAll,
    savePreferences,
  } = useConsent();

  // Local state for the settings modal toggles.
  const [analytics, setAnalytics] = useState(preferences.analytics);
  const [marketing, setMarketing] = useState(preferences.marketing);

  useEffect(() => {
    setAnalytics(preferences.analytics);
    setMarketing(preferences.marketing);
  }, [preferences.analytics, preferences.marketing, settingsOpen]);

  // Don't render until we've read localStorage (avoid flash) or if already decided
  // (unless the user explicitly reopened settings).
  if (!ready) return null;
  const showBanner = !hasDecided;
  if (!showBanner && !settingsOpen) return null;

  return (
    <>
      {/* ---------- Settings modal ---------- */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeSettings}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-[var(--color-primary)]" />
                <h2 className="text-lg font-bold text-gray-900">ตั้งค่าคุกกี้</h2>
              </div>
              <button
                type="button"
                onClick={closeSettings}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm text-gray-600">
                เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานของคุณ คุณสามารถเลือกประเภทคุกกี้ที่ยินยอมได้ที่นี่
                อ่านรายละเอียดเพิ่มเติมได้ที่{' '}
                <Link href="/cookie-policy" className="text-[var(--color-primary)] underline">
                  นโยบายคุกกี้
                </Link>
              </p>

              {/* Necessary */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="font-semibold text-gray-900">คุกกี้ที่จำเป็น</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    จำเป็นต่อการทำงานพื้นฐานของเว็บไซต์ ไม่สามารถปิดได้
                  </p>
                </div>
                <Toggle checked disabled />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="font-semibold text-gray-900">คุกกี้เพื่อการวิเคราะห์</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    ช่วยให้เราเข้าใจการใช้งานเว็บไซต์ เพื่อปรับปรุงให้ดียิ่งขึ้น (Google Analytics)
                  </p>
                </div>
                <Toggle checked={analytics} onChange={setAnalytics} />
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="font-semibold text-gray-900">คุกกี้เพื่อการตลาด</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    ใช้เพื่อแสดงโฆษณาที่เกี่ยวข้องกับคุณบนแพลตฟอร์มต่าง ๆ (Meta Pixel, TikTok)
                  </p>
                </div>
                <Toggle checked={marketing} onChange={setMarketing} />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                ปฏิเสธทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => savePreferences({ analytics, marketing })}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Bottom banner ---------- */}
      {showBanner && !settingsOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)]">
                  <Cookie className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  เว็บไซต์นี้ใช้คุกกี้เพื่อมอบประสบการณ์การใช้งานที่ดีที่สุด รวมถึงการวิเคราะห์และการตลาด
                  โดยการคลิก “ยอมรับทั้งหมด” คุณยินยอมให้เราใช้คุกกี้ตาม{' '}
                  <Link href="/cookie-policy" className="text-[var(--color-primary)] underline">
                    นโยบายคุกกี้
                  </Link>
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:justify-end">
                <button
                  type="button"
                  onClick={openSettings}
                  className="order-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:order-1"
                >
                  ตั้งค่า
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="order-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  ปฏิเสธ
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="order-1 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] sm:order-3"
                >
                  ยอมรับทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
