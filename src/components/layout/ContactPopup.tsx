"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Phone, MessageCircle, Facebook, Mail } from "lucide-react";
import { API_URL } from "@/lib/config";

interface PhoneItem {
  number: string;
  tel?: string;
}

interface ContactPopupConfig {
  is_active: boolean;
  heading: string;
  subheading: string;
  mascot_image: string;
  mascot_size?: number;
  qr_image: string;
  line_id: string;
  line_url: string;
  phones: PhoneItem[];
  hours_text: string;
  facebook_url: string;
  email: string;
  theme_color: string;
  position: "bottom-right" | "bottom-left";
  display_frequency: "always" | "once_per_session" | "once_per_day";
  delay_seconds: number;
  show_close_button: boolean;
  show_on_mobile: boolean;
}

const STORAGE_KEY = "contact_popup_dismissed_at";

function shouldShow(freq: string): boolean {
  if (typeof window === "undefined") return false;
  if (freq === "always") return true;
  if (freq === "once_per_session") {
    return !sessionStorage.getItem(STORAGE_KEY);
  }
  if (freq === "once_per_day") {
    const last = localStorage.getItem(STORAGE_KEY);
    if (!last) return true;
    const ts = Number(last);
    if (!Number.isFinite(ts)) return true;
    return Date.now() - ts > 24 * 60 * 60 * 1000;
  }
  return true;
}

function markDismissed(freq: string) {
  if (typeof window === "undefined") return;
  const now = Date.now().toString();
  if (freq === "once_per_session") sessionStorage.setItem(STORAGE_KEY, now);
  else if (freq === "once_per_day") localStorage.setItem(STORAGE_KEY, now);
}

function toTel(p: PhoneItem): string {
  const raw = (p.tel || p.number || "").replace(/[^\d+]/g, "");
  return raw;
}

export default function ContactPopup() {
  const [config, setConfig] = useState<ContactPopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/contact-popup/public`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const data: ContactPopupConfig | { is_active: false } = json?.data ?? {};
        if (!data || !data.is_active) return;
        setConfig(data as ContactPopupConfig);
      } catch {
        /* fail silently */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config) return;
    if (!shouldShow(config.display_frequency)) return;
    const delay = Math.max(0, Math.min(60, config.delay_seconds ?? 0)) * 1000;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [config]);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (config) markDismissed(config.display_frequency);
  }, [config]);

  if (!config || !visible) {
    // Show minimized re-open bubble if user closed & wants to reopen in-session
    if (config && minimized) {
      return (
        <button
          onClick={() => {
            setMinimized(false);
            setVisible(true);
          }}
          className="fixed z-[60] bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white"
          style={{ backgroundColor: config.theme_color || "#F97316" }}
          aria-label="เปิดป๊อปอัพติดต่อ"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      );
    }
    return null;
  }

  const positionClass =
    config.position === "bottom-left" ? "left-3 sm:left-4" : "right-3 sm:right-4";
  const hideOnMobile = !config.show_on_mobile ? "hidden md:block" : "";
  const color = config.theme_color || "#F97316";

  return (
    <div
      className={`fixed z-[60] bottom-3 sm:bottom-4 ${positionClass} ${hideOnMobile}`}
      role="dialog"
      aria-label={config.heading || "ติดต่อเรา"}
    >
      <div className="relative w-[220px] sm:w-[240px]">
        {/* Mascot */}
        {config.mascot_image && (() => {
          const size = Math.max(40, Math.min(400, Number(config.mascot_size) || 112));
          // Offset card upward by ~half mascot height so mascot sits above card
          const marginBottom = -Math.round(size * 0.25);
          return (
            <div
              className="flex justify-center relative z-10 pointer-events-none"
              style={{ marginBottom }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.mascot_image}
                alt=""
                style={{ width: size, height: size }}
                className="object-contain drop-shadow"
              />
            </div>
          );
        })()}

        {/* Card */}
        <div
          className="rounded-2xl text-white px-4 pb-4 pt-5 shadow-2xl relative"
          style={{ backgroundColor: color }}
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-medium mb-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {config.heading || "จองผ่านไลน์"}
            </div>
            {config.subheading && (
              <p className="text-[11px] sm:text-xs opacity-95 leading-snug">
                {config.subheading}
              </p>
            )}
          </div>

          {/* QR */}
          {config.qr_image && (
            <a
              href={config.line_url || "#"}
              target={config.line_url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block bg-white rounded-lg p-2 my-3 hover:scale-[1.02] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.qr_image}
                alt={config.line_id || "LINE QR"}
                className="w-full aspect-square object-contain"
                loading="lazy"
              />
            </a>
          )}

          {/* LINE ID */}
          {config.line_id && (
            <div className="text-center text-sm font-semibold mb-2 tracking-wide">
              {config.line_id}
            </div>
          )}

          {/* Phones */}
          {config.phones && config.phones.length > 0 && (
            <div className="border-t border-white/25 pt-2 space-y-1 text-xs sm:text-sm">
              {config.phones.map((p, i) => {
                const tel = toTel(p);
                return (
                  <a
                    key={i}
                    href={tel ? `tel:${tel}` : undefined}
                    className="flex items-center gap-1.5 justify-center hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {p.number}
                  </a>
                );
              })}
            </div>
          )}

          {/* Hours */}
          {config.hours_text && (
            <div className="text-center text-[11px] sm:text-xs mt-2 whitespace-pre-line opacity-95 border-t border-white/25 pt-2">
              {config.hours_text}
            </div>
          )}

          {/* Socials */}
          {(config.facebook_url || config.line_url || config.email) && (
            <div className="flex justify-center gap-2 mt-3">
              {config.facebook_url && (
                <a
                  href={config.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {config.line_url && (
                <a
                  href={config.line_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  aria-label="LINE"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {config.email && (
                <a
                  href={`mailto:${config.email}`}
                  className="w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Close */}
        {config.show_close_button && (
          <button
            onClick={() => {
              handleClose();
              setMinimized(true);
            }}
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
