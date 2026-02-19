"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, X, CheckCheck, ChevronRight, Gift } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notificationApi, PromotionNotification } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const TYPE_LABELS: Record<string, string> = {
  promotion: "โปรโมชั่น",
  flash_sale: "Flash Sale",
  birthday: "วันเกิด",
  special: "พิเศษ",
  custom: "ข่าวสาร",
};

const TYPE_COLORS: Record<string, string> = {
  promotion: "bg-orange-100 text-orange-700",
  flash_sale: "bg-red-100 text-red-700",
  birthday: "bg-pink-100 text-pink-700",
  special: "bg-purple-100 text-purple-700",
  custom: "bg-blue-100 text-blue-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} วันที่แล้ว`;
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell() {
  const { member } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<PromotionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Fetch -------------------------------------------------------

  const fetchUnreadCount = useCallback(async () => {
    if (!member) return;
    const res = await notificationApi.getUnreadCount();
    if (res.success && typeof res.count === "number") {
      setUnreadCount(res.count);
    }
  }, [member]);

  const fetchAll = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    const res = await notificationApi.getAll();
    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
      setUnreadCount(res.unread_count ?? 0);
    }
    setLoading(false);
  }, [member]);

  // Poll unread count every 60 s
  useEffect(() => {
    if (!member) return;
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 60_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [member, fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ---- Actions -----------------------------------------------------

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnreadCount(0);
  };

  if (!member) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-orange-500 transition-colors"
        aria-label="การแจ้งเตือน"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-orange-500" />
              <span className="font-semibold text-gray-800 text-sm">โปรโมชั่นสำหรับคุณ</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="ทำเครื่องหมายอ่านแล้วทั้งหมด"
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-10 flex justify-center">
                <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                <Bell size={32} className="opacity-30" />
                <p className="text-sm">ยังไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link
                href="/member/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                ดูทั้งหมด
                <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Sub-component -------------------------------------------------

function NotificationItem({
  notification: n,
  onClose,
}: {
  notification: PromotionNotification;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/member/notifications/${n.id}`}
      onClick={onClose}
      className={`flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-orange-50/60 ${
        n.is_read ? "" : "bg-orange-50/40 border-l-2 border-l-orange-400"
      }`}
    >
      {/* Banner thumbnail */}
      {n.banner_url ? (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={n.banner_url}
            alt={n.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-lg ${TYPE_COLORS[n.type] ?? "bg-gray-100 text-gray-500"}`}>
          {n.type === "flash_sale" ? "⚡" : n.type === "birthday" ? "🎂" : "🎁"}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug line-clamp-2 ${n.is_read ? "text-gray-700" : "text-gray-900"}`}>
            {n.title}
          </p>
          {!n.is_read && (
            <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </div>
        {n.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[n.type] ?? "bg-gray-100 text-gray-500"}`}>
            {TYPE_LABELS[n.type] ?? n.type}
          </span>
          <span className="text-[10px] text-gray-400">{timeAgo(n.created_at)}</span>
          {n.is_claimed && (
            <span className="text-[10px] font-semibold text-green-600">✓ รับสิทธิ์แล้ว</span>
          )}
          {!n.is_claimed && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-orange-500">
              <Gift size={9} /> รับสิทธิ์
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
