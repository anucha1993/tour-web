"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Mockup Data
const mockQuotations = [
  {
    id: 1,
    quotation_number: "QT2024020001",
    tour_name: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ 6 วัน 4 คืน",
    destination: "ญี่ปุ่น",
    travel_date: "2024-03-15",
    passengers: 4,
    total_price: 183600,
    status: "valid",
    status_label: "ใช้งานได้",
    valid_until: "2024-02-15",
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: 2,
    quotation_number: "QT2024010002",
    tour_name: "ทัวร์เกาหลี โซล เกาะนามิ 5 วัน 3 คืน",
    destination: "เกาหลีใต้",
    travel_date: "2024-04-10",
    passengers: 2,
    total_price: 51800,
    status: "expired",
    status_label: "หมดอายุ",
    valid_until: "2024-01-20",
    created_at: "2024-01-05T14:30:00Z",
  },
  {
    id: 3,
    quotation_number: "QT2024020003",
    tour_name: "ทัวร์สิงคโปร์ 4 วัน 3 คืน",
    destination: "สิงคโปร์",
    travel_date: "2024-05-01",
    passengers: 6,
    total_price: 119400,
    status: "converted",
    status_label: "แปลงเป็นการจองแล้ว",
    valid_until: "2024-02-28",
    created_at: "2024-02-03T09:15:00Z",
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: typeof CheckCircleIcon }> = {
  valid: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon },
  expired: { bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon },
  converted: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircleIcon },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon },
};

export default function QuotationsPage() {
  const { member } = useAuth();
  const [quotations] = useState(mockQuotations);

  if (!member) return null;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ใบเสนอราคาทัวร์</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Mockup</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{quotations.length} รายการ</p>
        </div>
      </div>

      {/* Quotations List */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีใบเสนอราคา</h3>
          <p className="text-gray-500 mb-6">เมื่อคุณขอใบเสนอราคา รายการจะแสดงที่นี่</p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            ค้นหาทัวร์
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => {
            const statusStyle = statusColors[quotation.status] || statusColors.pending;
            const StatusIcon = statusStyle.icon;
            const isValid = quotation.status === "valid";

            return (
              <div
                key={quotation.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="text-xs text-gray-500">
                        เลขที่: {quotation.quotation_number}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {quotation.status_label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {quotation.tour_name}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(quotation.travel_date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span>{quotation.passengers} ท่าน</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">ราคารวม</span>
                        <p className="font-semibold text-[var(--color-primary)]">
                          ฿{quotation.total_price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">ใช้ได้ถึง</span>
                        <p className={quotation.status === "expired" ? "text-red-600" : "text-gray-900"}>
                          {new Date(quotation.valid_until).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>ดู</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>ดาวน์โหลด PDF</span>
                    </button>
                    {isValid && (
                      <Link
                        href={`/member/quotations/${quotation.id}/book`}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
                      >
                        จองเลย
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  สร้างเมื่อ{" "}
                  {new Date(quotation.created_at).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
