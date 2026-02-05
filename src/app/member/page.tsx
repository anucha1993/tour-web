"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

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
];

export default function MemberDashboard() {
  const { member } = useAuth();

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
