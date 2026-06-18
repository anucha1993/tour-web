"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { quotationApi } from "@/lib/api";
import { ArrowLeftIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function NewQuotationPage() {
  const { member } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tour_id");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    pax_adult: 1,
    pax_child: 0,
    pax_infant: 0,
    travel_date_preference: "",
    notes: "",
  });

  // Hydrate from member when ready
  useState(() => {
    if (member) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || `${member.first_name} ${member.last_name}`.trim(),
        customer_phone: prev.customer_phone || member.phone || "",
        customer_email: prev.customer_email || member.email || "",
      }));
    }
  });

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await quotationApi.create({
        tour_id: tourId ? Number(tourId) : null,
        ...form,
      });
      if (res.success && res.data) {
        const created = res.data as { id: number };
        router.push(`/member/quotations/${created.id}`);
      } else {
        setError(res.message || "ไม่สามารถส่งคำขอได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const upd = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <Link href="/member/quotations" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeftIcon className="w-4 h-4" />
        กลับไปรายการ
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ขอใบเสนอราคา</h1>
          <p className="text-sm text-gray-500">เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                required
                value={form.customer_name}
                onChange={(e) => upd("customer_name", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทร *</label>
              <input
                type="tel"
                required
                value={form.customer_phone}
                onChange={(e) => upd("customer_phone", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
            <input
              type="email"
              value={form.customer_email}
              onChange={(e) => upd("customer_email", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ผู้ใหญ่ *</label>
              <input
                type="number"
                min={1}
                required
                value={form.pax_adult}
                onChange={(e) => upd("pax_adult", Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เด็ก</label>
              <input
                type="number"
                min={0}
                value={form.pax_child}
                onChange={(e) => upd("pax_child", Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ทารก</label>
              <input
                type="number"
                min={0}
                value={form.pax_infant}
                onChange={(e) => upd("pax_infant", Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ช่วงเวลาที่ต้องการเดินทาง</label>
            <input
              type="text"
              value={form.travel_date_preference}
              onChange={(e) => upd("travel_date_preference", e.target.value)}
              placeholder="เช่น ปลายเดือนเมษายน 2569"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด/ความต้องการเพิ่มเติม</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => upd("notes", e.target.value)}
              placeholder="เช่น ต้องการห้องเชื่อม, ทานอาหารเจ, ฯลฯ"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {tourId && (
            <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
              อ้างอิงทัวร์ ID: {tourId}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <Link href="/member/quotations" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำขอ"}
          </button>
        </div>
      </form>
    </div>
  );
}
