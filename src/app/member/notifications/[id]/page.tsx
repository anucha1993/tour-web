"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { Gift } from "lucide-react";
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

const TYPE_EMOJIS: Record<string, string> = {
  promotion: "🎁",
  flash_sale: "⚡",
  birthday: "🎂",
  special: "⭐",
  custom: "📢",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(endsAt: string | null) {
  if (!endsAt) return false;
  return new Date(endsAt) < new Date();
}

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [notification, setNotification] = useState<PromotionNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getOne(id);
      if (res.success && res.data) {
        setNotification(res.data);
        setClaimCode(res.data.claim_code ?? null);
        // Dispatch badge refresh event since it auto-marks as read
        window.dispatchEvent(new CustomEvent("notification-count-changed-refresh"));
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

  const handleClaim = async () => {
    if (!notification || notification.is_claimed || claiming) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await notificationApi.claim(id);
      if (res.success) {
        setNotification((prev) => prev ? { ...prev, is_claimed: true } : prev);
        if (res.claim_code) setClaimCode(res.claim_code);
      } else {
        setClaimError(res.message || "ไม่สามารถรับสิทธิ์ได้");
      }
    } catch {
      setClaimError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !notification) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-gray-400">
        <span className="text-5xl">🔍</span>
        <p className="font-medium">ไม่พบโปรโมชั่นนี้</p>
        <Link
          href="/member/notifications"
          className="text-sm text-orange-500 hover:underline"
        >
          ← กลับไปดูโปรโมชั่นทั้งหมด
        </Link>
      </div>
    );
  }

  const expired = isExpired(notification.ends_at);
  const limitReached = notification.max_claims !== null && notification.remaining_claims === 0;
  const canClaim = !notification.is_claimed && !expired && !limitReached;

  return (
    <div className="max-w-2xl mx-auto space-y-0">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          กลับ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        {notification.banner_url ? (
          <div className="relative w-full aspect-[16/7] bg-gray-100">
            <Image
              src={notification.banner_url}
              alt={notification.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className={`w-full py-12 flex flex-col items-center justify-center gap-2 text-4xl ${TYPE_COLORS[notification.type] ?? "bg-gray-100"}`}>
            <span className="text-6xl">{TYPE_EMOJIS[notification.type] ?? "🎁"}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Type + status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[notification.type] ?? "bg-gray-100 text-gray-600"}`}>
              {TYPE_LABELS[notification.type] ?? notification.type}
            </span>
            {notification.is_claimed && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                รับสิทธิ์แล้ว
              </span>
            )}
            {expired && !notification.is_claimed && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                หมดอายุแล้ว
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {notification.title}
          </h1>

          {/* Dates */}
          <div className="flex flex-col gap-1.5 text-sm text-gray-500">
            {notification.starts_at && (
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 flex-shrink-0 text-orange-400" />
                <span>เริ่ม {formatDate(notification.starts_at)}</span>
              </div>
            )}
            {notification.ends_at && (
              <div className="flex items-center gap-2">
                <ClockIcon className={`w-4 h-4 flex-shrink-0 ${expired ? "text-red-400" : "text-orange-400"}`} />
                <span className={expired ? "text-red-500 font-medium" : ""}>
                  สิ้นสุด {formatDate(notification.ends_at)}
                  {expired ? " (หมดอายุแล้ว)" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          {notification.description && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">รายละเอียดและเงื่อนไข</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {notification.description}
              </div>
            </div>
          )}

          {/* How to use */}
          {notification.how_to_use && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4 text-orange-500" />
                วิธีการใช้งาน
              </h2>
              <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {notification.how_to_use}
              </div>
            </div>
          )}

          {/* Claim section */}
          <div className="border-t border-gray-100 pt-5">
            {notification.is_claimed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">คุณรับสิทธิ์โปรโมชั่นนี้แล้ว</p>
                    <p className="text-sm text-green-600 mt-0.5">แสดงรหัสด้านล่างเมื่อทำการจองหรือติดต่อเจ้าหน้าที่</p>
                  </div>
                </div>
                {claimCode && (
                  <div className="bg-white border-2 border-orange-300 rounded-xl p-5 text-center space-y-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสสิทธิ์ของคุณ</p>
                    <p className="text-3xl font-mono font-bold text-orange-600 tracking-[0.25em]">
                      {claimCode}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(claimCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-medium transition-colors"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      {copied ? "คัดลอกแล้ว ✓" : "คัดลอกรหัส"}
                    </button>
                    <p className="text-xs text-gray-400">แจ้งรหัสนี้กับเจ้าหน้าที่เมื่อทำการจองเพื่อรับส่วนลด</p>
                  </div>
                )}
              </div>
            ) : expired ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <ClockIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-600">โปรโมชั่นนี้สิ้นสุดแล้ว</p>
                  <p className="text-sm text-gray-400 mt-0.5">ขออภัย ไม่สามารถรับสิทธิ์ได้อีกต่อไป</p>
                </div>
              </div>
            ) : notification.max_claims !== null && notification.remaining_claims === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <span className="text-3xl flex-shrink-0">😔</span>
                <div>
                  <p className="font-semibold text-red-700">สิทธิ์เต็มแล้ว</p>
                  <p className="text-sm text-red-500 mt-0.5">
                    โปรโมชั่นนี้ถูกรับสิทธิ์ครบ {notification.max_claims} สิทธิ์แล้ว
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Quota indicator */}
                {notification.max_claims !== null && notification.remaining_claims !== null && (
                  <div className="bg-orange-50 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-600 font-medium">
                      <span>สิทธิ์คงเหลือ</span>
                      <span className={notification.remaining_claims <= notification.max_claims * 0.2 ? "text-red-600 font-bold" : "text-orange-600"}>
                        {notification.remaining_claims} / {notification.max_claims} สิทธิ์
                      </span>
                    </div>
                    <div className="w-full bg-orange-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          notification.remaining_claims <= notification.max_claims * 0.2 ? "bg-red-400" : "bg-orange-400"
                        }`}
                        style={{ width: `${Math.min(100, (notification.remaining_claims / notification.max_claims) * 100)}%` }}
                      />
                    </div>
                    {notification.remaining_claims <= 5 && (
                      <p className="text-xs text-red-500 font-medium">⚠️ สิทธิ์ใกล้หมดแล้ว! รีบรับก่อนนะ</p>
                    )}
                  </div>
                )}
                <button
                  onClick={handleClaim}
                  disabled={!canClaim || claiming}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {claiming ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Gift className="w-5 h-5" />
                  )}
                  {claiming ? "กำลังรับสิทธิ์..." : "กดรับสิทธิ์โปรโมชั่น"}
                </button>
                {claimError && (
                  <p className="text-sm text-red-500 text-center">{claimError}</p>
                )}
                <p className="text-xs text-gray-400 text-center">
                  กดรับสิทธิ์เพื่อยืนยันการเข้าร่วมโปรโมชั่นนี้
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
