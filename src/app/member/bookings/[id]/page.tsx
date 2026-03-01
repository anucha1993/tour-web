"use client";

import React, { useState, useEffect } from "react";
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
  UserIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  TicketIcon,
  GlobeAltIcon,
  HashtagIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon as ShieldCheckSolidIcon,
} from "@heroicons/react/24/solid";
import { bookingApi, BookingResponse } from "@/lib/api";

/* ──────────────────────────── Status config ──────────────────────────── */

const statusConfig: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    icon: typeof CheckCircleIcon;
    label: string;
  }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: ClockIcon,
    label: "รอดำเนินการ",
  },
  confirmed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircleIcon,
    label: "ยืนยันแล้ว",
  },
  paid: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CreditCardIcon,
    label: "ชำระเงินแล้ว",
  },
  completed: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: CheckCircleIcon,
    label: "เดินทางแล้ว",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircleIcon,
    label: "ยกเลิก",
  },
};

/* ──────────────────────────── Component ──────────────────────────── */

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

  /* ── Helpers ── */
  const getTotalPassengers = (b: BookingResponse) =>
    (b.qty_adult || 0) +
    (b.qty_adult_single || 0) +
    (b.qty_child_bed || 0) +
    (b.qty_child_nobed || 0) +
    (b.qty_infant || 0);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;
    return `${days} วัน ${nights} คืน`;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ไม่พบข้อมูลการจอง
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "กรุณาตรวจสอบเลขที่การจองอีกครั้ง"}
          </p>
          <Link
            href="/member/bookings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition"
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

  /* ── Print handler ── */
  const handlePrint = () => window.print();

  /* ──────────────────────────── Render ──────────────────────────── */
  return (
    <div className="-m-6">
      {/* ── Print styles ── */}
      <style jsx global>{`
        @media print {
          /* Hide everything except booking content */
          body * { visibility: hidden; }
          #booking-print-area, #booking-print-area * { visibility: visible; }
          #booking-print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            padding: 20px 32px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Hide non-printable elements */
          .no-print { display: none !important; }
          /* Clean up for print */
          @page {
            margin: 12mm 10mm;
            size: A4;
          }
        }
      `}</style>

      {/* ── Back nav + Print button ── */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between no-print">
        <Link
          href="/member/bookings"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          กลับไปรายการจอง
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
        >
          <PrinterIcon className="w-4 h-4" />
          พิมพ์ใบจอง
        </button>
      </div>

      {/* ══════════ Printable area ══════════ */}
      <div id="booking-print-area">

      {/* ── Print header (visible only when printing) ── */}
      <div className="hidden print:block mb-4 pb-3 border-b-2 border-gray-300">
        <h1 className="text-lg font-bold text-gray-900">ใบจองทัวร์</h1>
        <p className="text-xs text-gray-500 mt-0.5">รหัสการจอง: {booking.booking_code} &middot; พิมพ์เมื่อ {new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* ── Tour thumbnail + title ── */}
      <div className="flex gap-3 items-start px-6 print:px-0 pb-4 border-b border-gray-100">
        <div className="relative w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {booking.tour?.effective_cover_image_url ? (
            <Image src={booking.tour.effective_cover_image_url} alt={booking.tour.title || "Tour"} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><GlobeAltIcon className="w-6 h-6 text-gray-300" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{booking.tour?.title || "ไม่ระบุชื่อทัวร์"}</p>
          {booking.tour?.slug && (
            <Link href={`/tours/${booking.tour.slug}`} className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-0.5">
              <DocumentTextIcon className="w-3 h-3" /> ดูรายละเอียดทัวร์
            </Link>
          )}
        </div>
      </div>

      {/* ── รายละเอียดทั้งหมด ── */}
      <div className="px-6 print:px-0 py-4 text-sm space-y-2.5">
        <Row label="รหัสการจอง" value={<span className="font-mono font-semibold">{booking.booking_code}</span>} />
        <Row label="สถานะ" value={<span className={`inline-flex items-center gap-1 font-semibold ${status.text}`}><StatusIcon className="w-3.5 h-3.5" />{status.label}</span>} />
        <Row label="จุดหมาย" value={booking.tour?.destination || "ไม่ระบุ"} />
        <Row label="วันเดินทาง" value={booking.period ? `${formatDate(booking.period.start_date)} — ${formatDate(booking.period.end_date)}` : "ไม่ระบุ"} />
        {booking.period && <Row label="ระยะเวลา" value={getDuration(booking.period.start_date, booking.period.end_date)} />}
        {booking.tour?.tour_code && <Row label="รหัสทัวร์" value={<span className="font-mono">{booking.tour.tour_code}</span>} />}
        <Row label="วันที่จอง" value={formatDate(booking.created_at)} />
        {isFlashSale && <Row label="แหล่งที่มา" value={<span className="inline-flex items-center gap-1 text-orange-600 font-medium"><BoltIcon className="w-3.5 h-3.5" />Flash Sale</span>} />}
        {booking.sale_code && <Row label="รหัสพนักงานขาย" value={booking.sale_code} />}
        <Row label="ชื่อผู้จอง" value={`${booking.first_name} ${booking.last_name}`} />
        <Row label="โทรศัพท์" value={booking.phone} />
        <Row label="อีเมล" value={<span className="break-all">{booking.email}</span>} />
        <Row label="จำนวนผู้เดินทาง" value={`${getTotalPassengers(booking)} ท่าน`} />

        {booking.qty_adult > 0 && (
          <PriceRow label={`ผู้ใหญ่ × ${booking.qty_adult}`} sub={`฿${Number(booking.price_adult).toLocaleString()}/ท่าน`} amount={Number(booking.price_adult) * booking.qty_adult} />
        )}
        {booking.qty_adult_single > 0 && (
          <PriceRow label={`ผู้ใหญ่ พักเดี่ยว × ${booking.qty_adult_single}`} sub={`฿${(Number(booking.price_adult) + Number(booking.price_single)).toLocaleString()}/ท่าน`} amount={(Number(booking.price_adult) + Number(booking.price_single)) * booking.qty_adult_single} />
        )}
        {booking.qty_child_bed > 0 && (
          <PriceRow label={`เด็ก มีเตียง × ${booking.qty_child_bed}`} sub={`฿${Number(booking.price_child_bed).toLocaleString()}/ท่าน`} amount={Number(booking.price_child_bed) * booking.qty_child_bed} />
        )}
        {booking.qty_child_nobed > 0 && (
          <PriceRow label={`เด็ก ไม่มีเตียง × ${booking.qty_child_nobed}`} sub={`฿${Number(booking.price_child_nobed).toLocaleString()}/ท่าน`} amount={Number(booking.price_child_nobed) * booking.qty_child_nobed} />
        )}
        {booking.qty_infant > 0 && (
          <PriceRow label={`ทารก × ${booking.qty_infant}`} sub={`฿${Number(booking.price_infant).toLocaleString()}/ท่าน`} amount={Number(booking.price_infant) * booking.qty_infant} />
        )}
        {isFlashSale && booking.flash_sale_item && (
          <div className="flex justify-between py-1 text-green-600">
            <span className="flex items-center gap-1 font-medium"><BoltIcon className="w-3.5 h-3.5" />ส่วนลด Flash Sale</span>
            <span className="font-semibold">-{booking.flash_sale_item.discount_percent}%</span>
          </div>
        )}

        {(booking.qty_triple > 0 || booking.qty_twin > 0 || booking.qty_double > 0 || booking.qty_adult_single > 0) && (
          <Row label="ห้องพัก" value={
            [
              booking.qty_triple > 0 && `Triple ${booking.qty_triple}`,
              booking.qty_twin > 0 && `Twin ${booking.qty_twin}`,
              booking.qty_double > 0 && `Double ${booking.qty_double}`,
              booking.qty_adult_single > 0 && `Single ${booking.qty_adult_single}`,
            ].filter(Boolean).join(", ")
          } />
        )}

        {booking.special_request && (
          <Row label="ความต้องการพิเศษ" value={booking.special_request} />
        )}
      </div>

      {/* ── ยอดรวม ── */}
      <div className="mx-6 print:mx-0 py-3 border-t-2 border-gray-200 flex justify-between items-baseline">
        <span className="font-semibold text-gray-900 text-sm">ยอดรวมทั้งหมด</span>
        <span className="text-xl font-extrabold text-[var(--color-primary)] print:text-gray-900">฿{Number(booking.total_amount).toLocaleString()}</span>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 print:px-0 py-3 mt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-400">
        <span className="flex items-center gap-1"><ShieldCheckSolidIcon className="w-3.5 h-3.5 text-emerald-500" />การจองปลอดภัย 100%</span>
        <a href="tel:-02-136-9144" className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:underline no-print">
          <PhoneIcon className="w-3.5 h-3.5" />ต้องการช่วยเหลือ? 02-136-9144
        </a>
      </div>

      </div>{/* end #booking-print-area */}
    </div>
  );
}

/* ──────────── Sub-Components ──────────── */

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}

function PriceRow({ label, sub, amount }: { label: string; sub: string; amount: number }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <div>
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-400 text-xs ml-1.5">({sub})</span>
      </div>
      <span className="font-medium text-gray-800 tabular-nums">฿{amount.toLocaleString()}</span>
    </div>
  );
}
