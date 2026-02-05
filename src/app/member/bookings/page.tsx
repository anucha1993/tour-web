"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardDocumentListIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Mockup Data
const mockBookings = [
  {
    id: 1,
    booking_number: "BK2024020001",
    tour: {
      name: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ 6 วัน 4 คืน",
      thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
      destination: "ญี่ปุ่น",
    },
    departure_date: "2024-03-15",
    passengers: 2,
    total_price: 91800,
    status: "confirmed",
    status_label: "ยืนยันแล้ว",
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: 2,
    booking_number: "BK2024020002",
    tour: {
      name: "ทัวร์เกาหลี โซล เกาะนามิ 5 วัน 3 คืน",
      thumbnail: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400",
      destination: "เกาหลีใต้",
    },
    departure_date: "2024-04-10",
    passengers: 4,
    total_price: 103600,
    status: "pending",
    status_label: "รอการชำระเงิน",
    created_at: "2024-01-28T14:30:00Z",
  },
  {
    id: 3,
    booking_number: "BK2024010003",
    tour: {
      name: "ทัวร์เวียดนาม ดานัง ฮอยอัน 4 วัน 3 คืน",
      thumbnail: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400",
      destination: "เวียดนาม",
    },
    departure_date: "2024-01-20",
    passengers: 2,
    total_price: 25800,
    status: "completed",
    status_label: "เดินทางแล้ว",
    created_at: "2024-01-05T09:15:00Z",
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: typeof CheckCircleIcon }> = {
  confirmed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon },
  completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircleIcon },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon },
};

export default function MemberBookings() {
  const { member } = useAuth();
  const [bookings] = useState(mockBookings);

  if (!member) return null;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">รายการจองทัวร์</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Mockup</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} รายการ</p>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardDocumentListIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีรายการจอง</h3>
          <p className="text-gray-500 mb-6">เมื่อคุณจองทัวร์ รายการจะแสดงที่นี่</p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            ค้นหาทัวร์
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusStyle = statusColors[booking.status] || statusColors.pending;
            const StatusIcon = statusStyle.icon;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                    <Image
                      src={booking.tour.thumbnail}
                      alt={booking.tour.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          เลขที่การจอง: {booking.booking_number}
                        </p>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {booking.tour.name}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {booking.status_label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{booking.tour.destination}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(booking.departure_date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span>{booking.passengers} ท่าน</span>
                      </div>
                      <div className="text-right sm:text-left">
                        <span className="font-semibold text-[var(--color-primary)]">
                          ฿{booking.total_price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        จองเมื่อ{" "}
                        {new Date(booking.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <Link
                        href={`/member/bookings/${booking.id}`}
                        className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
