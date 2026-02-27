"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function QuotationsPage() {
  const { member } = useAuth();

  if (!member) return null;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ใบเสนอราคาทัวร์</h1>
          <p className="text-gray-500 text-sm mt-1">รายการใบเสนอราคาของคุณ</p>
        </div>
      </div>

      {/* Coming Soon / Redirect to Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 text-center">
        <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <DocumentTextIcon className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีใบเสนอราคา</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          ขณะนี้ระบบใบเสนอราคากำลังพัฒนา หากคุณต้องการดูรายการจองทัวร์ของคุณ กรุณาไปที่หน้ารายการจองทัวร์
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/member/bookings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            ดูรายการจองทัวร์
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            ค้นหาทัวร์
          </Link>
        </div>
      </div>
    </div>
  );
}
