"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BoltIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  PrinterIcon,
  ShareIcon,
  ShieldCheckIcon,
  TicketIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { bookingApi, BookingResponse } from "@/lib/api";

const statusConfig: Record<string, { 
  bg: string; 
  text: string; 
  border: string;
  icon: typeof CheckCircleIcon; 
  label: string;
  step: number;
}> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: ClockIcon, label: "รอดำเนินการ", step: 1 },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircleIcon, label: "ยืนยันแล้ว", step: 2 },
  paid: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CreditCardIcon, label: "ชำระเงินแล้ว", step: 3 },
  completed: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: CheckCircleIcon, label: "เดินทางแล้ว", step: 4 },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircleIcon, label: "ยกเลิก", step: 0 },
};

const steps = [
  { id: 1, name: "รอดำเนินการ" },
  { id: 2, name: "ยืนยันแล้ว" },
  { id: 3, name: "ชำระเงินแล้ว" },
  { id: 4, name: "เดินทาง" },
];

export default function BookingDetailPage() {
  const { member } = useAuth();
  const params = useParams();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = Number(params.id);

  useEffect(() => {
    if (!member || !bookingId) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingApi.getBooking(bookingId);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError("ไม่พบข้อมูลการจอง");
        }
      } catch (err) {
        console.error("Failed to fetch booking:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [member, bookingId]);

  if (!member) return null;

  // Calculate total passengers
  const getTotalPassengers = (b: BookingResponse) => {
    return (
      (b.qty_adult || 0) +
      (b.qty_adult_single || 0) +
      (b.qty_child_bed || 0) +
      (b.qty_child_nobed || 0) +
      (b.qty_infant || 0)
    );
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("th-TH", { 
      weekday: "long",
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลการจอง</h2>
          <p className="text-gray-500 mb-6">{error || "กรุณาตรวจสอบเลขที่การจองอีกครั้ง"}</p>
          <Link
            href="/member/bookings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            กลับไปรายการจอง
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isFlashSale = booking.source === "flash_sale";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/member/bookings"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm font-medium transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        กลับไปรายการจอง
      </Link>

      {/* Success Banner */}
      {!isCancelled && (
        <div className={`${status.bg} ${status.border} border rounded-2xl p-4 lg:p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${status.text} bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className={`text-lg lg:text-xl font-bold ${status.text}`}>
                    {status.label === "รอดำเนินการ" ? "การจองของคุณอยู่ระหว่างดำเนินการ" : 
                     status.label === "ยืนยันแล้ว" ? "การจองของคุณได้รับการยืนยันแล้ว" :
                     status.label === "ชำระเงินแล้ว" ? "การจองของคุณชำระเงินเรียบร้อยแล้ว" :
                     "การจองของคุณเสร็จสมบูรณ์แล้ว"}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    เลขที่การจอง: <span className="font-mono font-semibold text-gray-900">{booking.booking_code}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 rounded-lg bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                    title="พิมพ์"
                  >
                    <PrinterIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: `การจอง ${booking.booking_code}`, url: window.location.href });
                      }
                    }}
                    className="p-2 rounded-lg bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                    title="แชร์"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="mt-4 hidden sm:block">
                <div className="flex items-center">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                          ${status.step >= step.id ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white/50 text-gray-400'}`}
                        >
                          {status.step > step.id ? (
                            <CheckCircleSolidIcon className="w-5 h-5 text-emerald-500" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <span className={`ml-2 text-xs font-medium ${status.step >= step.id ? 'text-gray-700' : 'text-gray-400'}`}>
                          {step.name}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-3 ${status.step > step.id ? 'bg-emerald-300' : 'bg-gray-200/50'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 lg:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircleIcon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-red-700">การจองนี้ถูกยกเลิกแล้ว</h1>
              <p className="text-gray-600 text-sm">เลขที่การจอง: <span className="font-mono font-semibold">{booking.booking_code}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative w-full md:w-72 h-48 md:h-56 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
                {booking.tour?.effective_cover_image_url ? (
                  <Image
                    src={booking.tour.effective_cover_image_url}
                    alt={booking.tour.title || "Tour"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <GlobeAltIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {isFlashSale && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <BoltIcon className="w-4 h-4" />
                    Flash Sale
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex items-start gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                    <TicketIcon className="w-3 h-3" />
                    แพ็คเกจทัวร์
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {booking.tour?.title || "ไม่ระบุชื่อทัวร์"}
                </h2>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">จุดหมายปลายทาง</p>
                      <p className="font-medium text-gray-900">{booking.tour?.destination || "ไม่ระบุ"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">วันเดินทาง</p>
                      <p className="font-medium text-gray-900">
                        {booking.period ? formatDate(booking.period.start_date) : "ไม่ระบุ"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">จำนวนผู้เดินทาง</p>
                      <p className="font-medium text-gray-900">{getTotalPassengers(booking)} ท่าน</p>
                    </div>
                  </div>
                </div>

                {booking.tour?.slug && (
                  <Link
                    href={`/tours/${booking.tour.slug}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    ดูรายละเอียดทัวร์
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Traveler Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">รายละเอียดผู้เดินทาง</h3>
                <p className="text-xs text-gray-500">Traveler Details</p>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {booking.qty_adult > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">ผู้ใหญ่</span>
                        <span className="text-gray-500 text-sm ml-2">× {booking.qty_adult}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">฿{(Number(booking.price_adult) * booking.qty_adult).toLocaleString()}</span>
                  </div>
                )}
                {booking.qty_adult_single > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">ผู้ใหญ่ (ห้องพักเดี่ยว)</span>
                        <span className="text-gray-500 text-sm ml-2">× {booking.qty_adult_single}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">฿{((Number(booking.price_adult) + Number(booking.price_single)) * booking.qty_adult_single).toLocaleString()}</span>
                  </div>
                )}
                {booking.qty_child_bed > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">เด็ก (มีเตียง)</span>
                        <span className="text-gray-500 text-sm ml-2">× {booking.qty_child_bed}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">฿{(Number(booking.price_child_bed) * booking.qty_child_bed).toLocaleString()}</span>
                  </div>
                )}
                {booking.qty_child_nobed > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">เด็ก (ไม่มีเตียง)</span>
                        <span className="text-gray-500 text-sm ml-2">× {booking.qty_child_nobed}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">฿{(Number(booking.price_child_nobed) * booking.qty_child_nobed).toLocaleString()}</span>
                  </div>
                )}
                {booking.qty_infant > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">ทารก</span>
                        <span className="text-gray-500 text-sm ml-2">× {booking.qty_infant}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">฿{(Number(booking.price_infant) * booking.qty_infant).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room Allocation */}
          {(booking.qty_triple > 0 || booking.qty_twin > 0 || booking.qty_double > 0 || booking.qty_adult_single > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">การจัดห้องพัก</h3>
                  <p className="text-xs text-gray-500">Room Allocation</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {booking.qty_triple > 0 && (
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">{booking.qty_triple}</p>
                      <p className="text-sm text-gray-600 mt-1">Triple</p>
                      <p className="text-xs text-gray-400">3 ท่าน/ห้อง</p>
                    </div>
                  )}
                  {booking.qty_twin > 0 && (
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{booking.qty_twin}</p>
                      <p className="text-sm text-gray-600 mt-1">Twin</p>
                      <p className="text-xs text-gray-400">2 ท่าน/ห้อง</p>
                    </div>
                  )}
                  {booking.qty_double > 0 && (
                    <div className="text-center p-4 bg-teal-50 rounded-xl">
                      <p className="text-2xl font-bold text-teal-600">{booking.qty_double}</p>
                      <p className="text-sm text-gray-600 mt-1">Double</p>
                      <p className="text-xs text-gray-400">2 ท่าน/ห้อง</p>
                    </div>
                  )}
                  {booking.qty_adult_single > 0 && (
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <p className="text-2xl font-bold text-orange-600">{booking.qty_adult_single}</p>
                      <p className="text-sm text-gray-600 mt-1">Single</p>
                      <p className="text-xs text-gray-400">1 ท่าน/ห้อง</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Special Request */}
          {booking.special_request && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">ความต้องการพิเศษ</h3>
                  <p className="text-xs text-gray-500">Special Request</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 bg-amber-50 p-4 rounded-xl">{booking.special_request}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">ข้อมูลผู้จอง</h3>
                <p className="text-xs text-gray-500">Contact Info</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">ชื่อ-นามสกุล</p>
                  <p className="font-medium text-gray-900">{booking.first_name} {booking.last_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">เบอร์โทรศัพท์</p>
                  <p className="font-medium text-gray-900">{booking.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">อีเมล</p>
                  <p className="font-medium text-gray-900 break-all">{booking.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-orange-500 flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">สรุปยอดชำระ</h3>
                <p className="text-xs text-gray-500">Payment Summary</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {isFlashSale && booking.flash_sale_item && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ราคาปกติ</span>
                    <span className="text-gray-400 line-through">
                      ฿{(Number(booking.total_amount) / (1 - booking.flash_sale_item.discount_percent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <BoltIcon className="w-4 h-4" />
                      ส่วนลด Flash Sale
                    </span>
                    <span className="text-green-600 font-medium">-{booking.flash_sale_item.discount_percent}%</span>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ยอดรวมทั้งหมด</span>
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    ฿{Number(booking.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Meta */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">วันที่จอง</span>
              <span className="font-medium text-gray-900">
                {new Date(booking.created_at).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">แหล่งที่มา</span>
              <span className="font-medium text-gray-900">
                {isFlashSale ? "Flash Sale" : "เว็บไซต์"}
              </span>
            </div>
            {booking.sale_code && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">รหัสพนักงานขาย</span>
                <span className="font-medium text-gray-900">{booking.sale_code}</span>
              </div>
            )}
          </div>

          {/* Trust Badge */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-800 text-sm">การจองปลอดภัย</p>
                <p className="text-xs text-emerald-600">ข้อมูลของคุณได้รับการเข้ารหัส</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
