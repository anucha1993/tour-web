"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { notificationApi, PromotionNotification } from "@/lib/api";
import {
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  CheckBadgeIcon,
  CalendarIcon,
  BellIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface QuickLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
}

const quickLinks: QuickLink[] = [
  {
    href: "/member/profile",
    icon: UserIcon,
    label: "บัญชีของฉัน",
    description: "จัดการข้อมูลส่วนตัว",
    color: "bg-blue-500",
  },
  {
    href: "/member/wishlist",
    icon: HeartIcon,
    label: "ทัวร์ที่ถูกใจ",
    description: "ทัวร์ที่บันทึกไว้",
    color: "bg-red-500",
  },
  {
    href: "/member/bookings",
    icon: ClipboardDocumentListIcon,
    label: "รายการจองทัวร์",
    description: "ประวัติการจอง",
    color: "bg-green-500",
  },
  {
    href: "/member/billing-address",
    icon: MapPinIcon,
    label: "ที่อยู่ออกใบกำกับภาษี",
    description: "จัดการที่อยู่",
    color: "bg-purple-500",
  },
  {
    href: "/member/points",
    icon: TrophyIcon,
    label: "คะแนนสะสม",
    description: "ดูแต้มและสิทธิประโยชน์",
    color: "bg-yellow-500",
  },
  {
    href: "/member/notifications",
    icon: BellIcon,
    label: "โปรโมชั่นสำหรับคุณ",
    description: "ข้อเสนอพิเศษและโปรโมชั่น",
    color: "bg-orange-500",
  },
];

export default function MemberDashboard() {
  const { member } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const [notifications, setNotifications] = useState<PromotionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationApi.getAll().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data.slice(0, 3));
        setUnreadCount(res.unread_count ?? 0);
      }
    });
  }, []);

  if (!member) {
    return null;
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-orange-600 rounded-2xl p-6 lg:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">
                สวัสดี, {member.first_name || "สมาชิก"}!
              </h1>
              <p className="text-orange-100 text-sm lg:text-base mt-1">
                ยินดีต้อนรับกลับมา
              </p>
              {member.is_verified && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                  ยืนยันตัวตนแล้ว
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <ClockIcon className="w-4 h-4" />
            <span>
              สมาชิกตั้งแต่{" "}
              {new Date(member.created_at).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Favorite Tours Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">ทัวร์ที่ถูกใจ</h2>
          <Link 
            href="/member/wishlist" 
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm font-medium"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HeartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">ยังไม่มีทัวร์ที่ถูกใจ</p>
            <Link 
              href="/tours" 
              className="inline-block mt-4 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm font-medium"
            >
              ค้นหาทัวร์ที่คุณชอบ →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.slice(0, 3).map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100"
              >
                <div className="relative aspect-square">
                  {tour.image_url ? (
                    <Image
                      src={tour.image_url}
                      alt={tour.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                      <MapPinIcon className="w-12 h-12 text-orange-400" />
                    </div>
                  )}
                  <button 
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    onClick={(e) => { e.preventDefault(); removeFavorite(tour.id); }}
                  >
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  </button>
                  {tour.country_name && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full">
                        {tour.country_name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {tour.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{tour.days} วัน {tour.nights} คืน</span>
                  </div>
                  {tour.price != null && (
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-[var(--color-primary)] font-bold text-lg">
                        ฿{tour.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-xs">/ท่าน</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Promotions / Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">โปรโมชั่นสำหรับคุณ</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                {unreadCount} ใหม่
              </span>
            )}
          </div>
          <Link
            href="/member/notifications"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm font-medium"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
            <BellIcon className="w-10 h-10 mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">ยังไม่มีโปรโมชั่นสำหรับคุณในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={`/member/notifications/${n.id}`}
                className={`group bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  n.is_read ? "border-gray-100" : "border-orange-200"
                }`}
              >
                {n.banner_url ? (
                  <div className="relative h-28 w-full bg-gray-100">
                    <Image src={n.banner_url} alt={n.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-28 w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl">
                    {n.type === "flash_sale" ? "⚡" : n.type === "birthday" ? "🎂" : "🎁"}
                  </div>
                )}
                <div className="p-3">
                  {!n.is_read && (
                    <span className="inline-block mb-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full">
                      ใหม่
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {n.title}
                  </p>
                  {n.ends_at && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      หมดอายุ{" "}
                      {new Date(n.ends_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">เมนูลัด</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all group border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${link.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}
                >
                  <link.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                </div>
                <div className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลบัญชี</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">ชื่อ-นามสกุล</span>
              <span className="font-medium text-gray-900">
                {member.first_name} {member.last_name || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">เบอร์โทรศัพท์</span>
              <span className="font-medium text-gray-900">{member.phone}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">อีเมล</span>
              <span className="font-medium text-gray-900">{member.email || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Line ID</span>
              <span className="font-medium text-gray-900">{member.line_id || "-"}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/member/profile"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm font-medium"
          >
            แก้ไขข้อมูลส่วนตัว →
          </Link>
        </div>
      </div>
    </div>
  );
}
