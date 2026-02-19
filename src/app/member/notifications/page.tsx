"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, CheckCheck, ChevronRight, Gift, CheckCircle2 } from "lucide-react";
import { notificationApi, PromotionNotification } from "@/lib/api";

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
    year: "numeric",
  });
}

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<PromotionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await notificationApi.getAll();
    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
      setUnreadCount(res.unread_count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnreadCount(0);
    window.dispatchEvent(new CustomEvent('notification-count-changed', { detail: { count: 0 } }));
  };

  // Refresh list when returning from detail page (badge may have changed)
  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener('notification-count-changed-refresh', handler);
    return () => window.removeEventListener('notification-count-changed-refresh', handler);
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">โปรโมชั่นสำหรับคุณ</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} รายการยังไม่ได้อ่าน` : "อ่านแล้วทั้งหมด"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            อ่านแล้วทั้งหมด
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Bell className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">ยังไม่มีโปรโมชั่นสำหรับคุณในขณะนี้</p>
            <p className="text-xs text-gray-400">เราจะแจ้งเตือนเมื่อมีโปรโมชั่นพิเศษสำหรับคุณ</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({
  notification: n,
}: {
  notification: PromotionNotification;
}) {
  return (
    <Link
      href={`/member/notifications/${n.id}`}
      className={`flex gap-4 p-4 sm:p-5 transition-colors hover:bg-orange-50/50 ${
        n.is_read ? "" : "bg-orange-50/30 border-l-4 border-l-orange-400"
      }`}
    >
      {/* Thumbnail */}
      {n.banner_url ? (
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={n.banner_url}
            alt={n.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
            TYPE_COLORS[n.type] ?? "bg-gray-100"
          }`}
        >
          {n.type === "flash_sale" ? "⚡" : n.type === "birthday" ? "🎂" : "🎁"}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`font-semibold text-sm sm:text-base leading-snug line-clamp-2 ${n.is_read ? "text-gray-700" : "text-gray-900"}`}>
            {n.title}
          </p>
          {!n.is_read && (
            <span className="flex-shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full bg-orange-500" />
          )}
        </div>
        {n.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              TYPE_COLORS[n.type] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {TYPE_LABELS[n.type] ?? n.type}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
          {n.ends_at && (
            <span className="text-xs text-gray-400">
              หมดอายุ{" "}
              {new Date(n.ends_at).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {n.is_claimed ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              รับสิทธิ์แล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
              <Gift className="w-3 h-3" />
              รับสิทธิ์
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 self-center">
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </Link>
  );
}
