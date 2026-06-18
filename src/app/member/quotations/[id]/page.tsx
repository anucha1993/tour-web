"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { quotationApi, Quotation } from "@/lib/api";
import {
  ArrowLeftIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const STATUS_BADGE: Record<Quotation["status"], { text: string; color: string }> = {
  requested: { text: "รอเจ้าหน้าที่", color: "bg-blue-100 text-blue-700" },
  draft: { text: "กำลังดำเนินการ", color: "bg-gray-100 text-gray-700" },
  sent: { text: "พร้อมตัดสินใจ", color: "bg-amber-100 text-amber-800" },
  accepted: { text: "ยอมรับแล้ว", color: "bg-green-100 text-green-700" },
  declined: { text: "ปฏิเสธแล้ว", color: "bg-red-100 text-red-700" },
  expired: { text: "หมดอายุ", color: "bg-gray-100 text-gray-500" },
  cancelled: { text: "ยกเลิก", color: "bg-gray-100 text-gray-500" },
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const { member } = useAuth();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await quotationApi.get(id);
    if (res.success && res.data) {
      setQuotation((res.data as { data?: Quotation }).data || (res.data as Quotation));
    } else {
      setMessage({ type: "error", text: res.message || "ไม่พบใบเสนอราคา" });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const handleAccept = async () => {
    if (!confirm("ยืนยันยอมรับใบเสนอราคานี้?")) return;
    setActionLoading(true);
    const res = await quotationApi.accept(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: res.message || "ยอมรับแล้ว" });
      load();
    } else {
      setMessage({ type: "error", text: res.message || "ไม่สำเร็จ" });
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    const res = await quotationApi.decline(id, declineReason);
    setActionLoading(false);
    if (res.success) {
      setShowDeclineForm(false);
      setMessage({ type: "success", text: res.message || "ปฏิเสธแล้ว" });
      load();
    } else {
      setMessage({ type: "error", text: res.message || "ไม่สำเร็จ" });
    }
  };

  if (!member) return null;

  if (loading) {
    return <div className="p-6 text-center text-gray-400">กำลังโหลด...</div>;
  }
  if (!quotation) {
    return (
      <div className="p-6 text-center text-gray-400">
        ไม่พบข้อมูล
        <button onClick={() => router.back()} className="block mx-auto mt-2 text-blue-600">กลับ</button>
      </div>
    );
  }

  const formatDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("th-TH") : "-");
  const formatMoney = (n: number | string) =>
    Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalPax = quotation.pax_adult + quotation.pax_child + quotation.pax_infant;
  const canAct = quotation.status === "sent";

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href="/member/quotations" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="w-4 h-4" /> กลับไปรายการ
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <PrinterIcon className="w-4 h-4" /> พิมพ์
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 print:hidden ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print:border-0 print:shadow-none">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 print:bg-white">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">ใบเสนอราคา</div>
              <div className="font-mono text-sm text-gray-600 mt-1">{quotation.quotation_number}</div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[quotation.status].color}`}>
                {STATUS_BADGE[quotation.status].text}
              </span>
              <div className="text-xs text-gray-500 mt-2">
                ออกเมื่อ: {formatDate(quotation.sent_at || quotation.created_at)}
              </div>
              {quotation.valid_until && (
                <div className="text-xs text-gray-500">มีอายุถึง: {formatDate(quotation.valid_until)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">ชื่อ:</span> {quotation.customer_name}</div>
            <div><span className="text-gray-500">โทร:</span> {quotation.customer_phone}</div>
            <div><span className="text-gray-500">อีเมล:</span> {quotation.customer_email || "-"}</div>
            <div><span className="text-gray-500">จำนวน:</span> ผู้ใหญ่ {quotation.pax_adult} / เด็ก {quotation.pax_child} / ทารก {quotation.pax_infant} (รวม {totalPax} ท่าน)</div>
            {quotation.travel_date_preference && (
              <div className="md:col-span-2"><span className="text-gray-500">ช่วงเวลาที่ต้องการ:</span> {quotation.travel_date_preference}</div>
            )}
          </div>
        </div>

        {/* Quotation details */}
        {quotation.status === "requested" ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">เจ้าหน้าที่ได้รับคำขอของคุณแล้ว กำลังจัดทำใบเสนอราคา</p>
          </div>
        ) : (
          <div className="p-6">
            {quotation.title && <h2 className="text-lg font-semibold text-gray-900 mb-2">{quotation.title}</h2>}
            {quotation.description && <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{quotation.description}</p>}

            {quotation.items && quotation.items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">รายการ</th>
                      <th className="px-3 py-2 text-right w-20">จำนวน</th>
                      <th className="px-3 py-2 text-right w-32">ราคา/หน่วย</th>
                      <th className="px-3 py-2 text-right w-32">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{it.description}</td>
                        <td className="px-3 py-2 text-right">{it.qty}</td>
                        <td className="px-3 py-2 text-right">{formatMoney(it.unit_price)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatMoney(it.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr><td colSpan={3} className="px-3 py-2 text-right">รวม</td><td className="px-3 py-2 text-right">฿{formatMoney(quotation.subtotal)}</td></tr>
                    {Number(quotation.discount) > 0 && (
                      <tr><td colSpan={3} className="px-3 py-2 text-right">ส่วนลด</td><td className="px-3 py-2 text-right text-red-600">-฿{formatMoney(quotation.discount)}</td></tr>
                    )}
                    <tr className="text-base font-bold">
                      <td colSpan={3} className="px-3 py-2 text-right">ยอดรวมสุทธิ</td>
                      <td className="px-3 py-2 text-right text-blue-600">฿{formatMoney(quotation.total_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">ยังไม่มีรายการ</p>
            )}

            {quotation.admin_notes && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-xs text-amber-700 font-medium mb-1">เงื่อนไข/หมายเหตุ</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{quotation.admin_notes}</div>
              </div>
            )}

            {quotation.notes && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">หมายเหตุจากคุณ</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{quotation.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {canAct && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 print:hidden">
            {showDeclineForm ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผลที่ปฏิเสธ (ไม่บังคับ)</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDeclineForm(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? "..." : "ยืนยันปฏิเสธ"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end flex-wrap">
                <button
                  onClick={() => setShowDeclineForm(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" /> ปฏิเสธ
                </button>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" /> ยอมรับใบเสนอราคา
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          aside,
          nav,
          header,
          footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
