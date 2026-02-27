"use client";

import { useState, useEffect } from "react";
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
  BoltIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { bookingApi, BookingResponse } from "@/lib/api";

const statusConfig: Record<string, { bg: string; text: string; icon: typeof CheckCircleIcon; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon, label: "รอดำเนินการ" },
  confirmed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon, label: "ยืนยันแล้ว" },
  paid: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircleIcon, label: "ชำระเงินแล้ว" },
  completed: { bg: "bg-purple-100", text: "text-purple-700", icon: CheckCircleIcon, label: "เดินทางแล้ว" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon, label: "ยกเลิก" },
};

export default function MemberBookings() {
  const { member } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await bookingApi.myBookings();
        if (res.success && res.data?.data) {
          setBookings(res.data.data);
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [member]);

  if (!member) return null;

  // Calculate total passengers
  const getTotalPassengers = (booking: BookingResponse) => {
    return (
      (booking.qty_adult || 0) +
      (booking.qty_adult_single || 0) +
      (booking.qty_child_bed || 0) +
      (booking.qty_child_nobed || 0) +
      (booking.qty_infant || 0)
    );
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">รายการจองทัวร์</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "กำลังโหลด..." : `${bookings.length} รายการ`}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ArrowPathIcon className="w-10 h-10 mx-auto text-gray-400 animate-spin" />
          <p className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
          <XCircleIcon className="w-12 h-12 mx-auto text-red-400" />
          <p className="text-red-600 mt-4">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
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
      )}

      {/* Bookings List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isFlashSale = booking.source === "flash_sale";

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0 bg-gray-100">
                    {booking.tour?.effective_cover_image_url ? (
                      <Image
                        src={booking.tour.effective_cover_image_url}
                        alt={booking.tour.title || "Tour"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPinIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {/* Flash Sale Badge */}
                    {isFlashSale && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <BoltIcon className="w-3 h-3" />
                        Flash Sale
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          เลขที่การจอง: <span className="font-medium">{booking.booking_code}</span>
                        </p>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {booking.tour?.title || "ไม่ระบุชื่อทัวร์"}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} whitespace-nowrap`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{booking.tour?.destination || "ไม่ระบุ"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {booking.period
                            ? formatDateRange(booking.period.start_date, booking.period.end_date)
                            : "ไม่ระบุ"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <UserGroupIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{getTotalPassengers(booking)} ท่าน</span>
                      </div>
                      <div className="text-right sm:text-left">
                        {isFlashSale && booking.flash_sale_item && (
                          <span className="text-xs text-gray-400 line-through mr-1">
                            ฿{(Number(booking.total_amount) / (1 - booking.flash_sale_item.discount_percent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        )}
                        <span className="font-semibold text-[var(--color-primary)]">
                          ฿{Number(booking.total_amount).toLocaleString()}
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
