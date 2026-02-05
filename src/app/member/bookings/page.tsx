"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeftIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

export default function MemberBookings() {
  const router = useRouter();
  const { member, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !member) {
      router.push("/login");
    }
  }, [member, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  // TODO: Implement booking history
  const bookings: unknown[] = [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/member"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ประวัติการจอง</h1>
            <p className="text-sm text-gray-500">{bookings.length} รายการ</p>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TicketIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีประวัติการจอง</h3>
            <p className="text-gray-500 mb-6">เมื่อคุณจองทัวร์ รายการจะแสดงที่นี่</p>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              ค้นหาทัวร์
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Booking cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
}
