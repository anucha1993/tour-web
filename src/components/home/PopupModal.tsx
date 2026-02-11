"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { API_URL } from "@/lib/config";

interface PopupData {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  alt_text: string | null;
  button_text: string | null;
  button_link: string | null;
  button_color: string;
  popup_type: string;
  display_frequency: string;
  delay_seconds: number;
  start_date: string | null;
  end_date: string | null;
  show_close_button: boolean;
  close_on_overlay: boolean;
  width: number | null;
  height: number | null;
}

function getStorageKey(popupId: number, frequency: string): string {
  return `popup_dismissed_${popupId}_${frequency}`;
}

function shouldShowPopup(popup: PopupData): boolean {
  if (typeof window === "undefined") return false;

  const key = getStorageKey(popup.id, popup.display_frequency);

  switch (popup.display_frequency) {
    case "always":
      return true;

    case "once_per_session": {
      const dismissed = sessionStorage.getItem(key);
      return !dismissed;
    }

    case "once_per_day": {
      const lastDismissed = localStorage.getItem(key);
      if (!lastDismissed) return true;
      const dismissedDate = new Date(lastDismissed);
      const now = new Date();
      return (
        now.getTime() - dismissedDate.getTime() > 24 * 60 * 60 * 1000
      );
    }

    case "once_per_week": {
      const lastDismissed = localStorage.getItem(key);
      if (!lastDismissed) return true;
      const dismissedDate = new Date(lastDismissed);
      const now = new Date();
      return (
        now.getTime() - dismissedDate.getTime() > 7 * 24 * 60 * 60 * 1000
      );
    }

    case "once": {
      const dismissed = localStorage.getItem(key);
      return !dismissed;
    }

    default:
      return true;
  }
}

function markDismissed(popup: PopupData) {
  if (typeof window === "undefined") return;

  const key = getStorageKey(popup.id, popup.display_frequency);

  switch (popup.display_frequency) {
    case "once_per_session":
      sessionStorage.setItem(key, "1");
      break;
    case "once_per_day":
    case "once_per_week":
      localStorage.setItem(key, new Date().toISOString());
      break;
    case "once":
      localStorage.setItem(key, "1");
      break;
  }
}

export default function PopupModal() {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const currentPopup = popups[currentIndex] || null;

  useEffect(() => {
    async function fetchPopups() {
      try {
        const res = await fetch(`${API_URL}/popups/public`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const eligible = (json.data as PopupData[]).filter(shouldShowPopup);
          if (eligible.length > 0) {
            setPopups(eligible);
          }
        }
      } catch {
        // silently fail
      }
    }
    fetchPopups();
  }, []);

  // Show popup with delay
  useEffect(() => {
    if (popups.length === 0) return;
    const popup = popups[0];
    const delay = (popup.delay_seconds || 0) * 1000;

    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [popups]);

  const handleClose = useCallback(() => {
    if (!currentPopup) return;
    setClosing(true);
    markDismissed(currentPopup);

    setTimeout(() => {
      setClosing(false);
      // Show next popup if available
      if (currentIndex + 1 < popups.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setVisible(false);
      }
    }, 200);
  }, [currentPopup, currentIndex, popups.length]);

  const handleOverlayClick = useCallback(() => {
    if (currentPopup?.close_on_overlay) {
      handleClose();
    }
  }, [currentPopup, handleClose]);

  const handleButtonClick = useCallback(() => {
    if (currentPopup?.button_link) {
      window.open(currentPopup.button_link, "_blank", "noopener,noreferrer");
    }
    handleClose();
  }, [currentPopup, handleClose]);

  // ESC key to close
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, handleClose]);

  if (!visible || !currentPopup) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={handleOverlayClick}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[90vh] transition-transform duration-200 ${
          closing ? "scale-95" : "scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {currentPopup.show_close_button && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Image */}
        {currentPopup.image_url && (
          <div className="relative w-full">
            <Image
              src={currentPopup.image_url}
              alt={currentPopup.alt_text || currentPopup.title}
              width={currentPopup.width || 600}
              height={currentPopup.height || 400}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        {(currentPopup.title ||
          currentPopup.description ||
          currentPopup.button_text) && (
          <div className="p-6">
            {currentPopup.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {currentPopup.title}
              </h2>
            )}
            {currentPopup.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {currentPopup.description}
              </p>
            )}
            {currentPopup.button_text && (
              <button
                onClick={handleButtonClick}
                className="w-full py-3 px-6 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: currentPopup.button_color || "#3B82F6" }}
              >
                {currentPopup.button_text}
              </button>
            )}
          </div>
        )}

        {/* Popup counter */}
        {popups.length > 1 && (
          <div className="px-6 pb-4 flex justify-center gap-1.5">
            {popups.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
