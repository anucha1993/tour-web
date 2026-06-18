"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { quotationApi, Quotation } from "@/lib/api";
import {
  DocumentTextIcon,
  PlusIcon,
  ChevronRightIcon,
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

export default function QuotationsPage() {
  const { member } = useAuth();
  const [list, setList] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await quotationApi.list();
    if (res.success && res.data) {
      const inner = (res.data as { data?: Quotation[] }).data;
      setList(Array.isArray(inner) ? inner : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!member) return null;

  const formatDate = (s: string) => new Date(s).toLocaleDateString("th-TH");
  const formatMoney = (n: number | string) =>
    Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ใบเสนอราคาทัวร์</h1>
          <p className="text-gray-500 text-sm mt-1">รายการใบเสนอราคาของคุณ</p>
        </div>
        <Link
          href="/member/quotations/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-orange-600"
        >
          <PlusIcon className="w-4 h-4" />
          ขอใบเสนอราคาใหม่
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">กำลังโหลด...</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <DocumentTextIcon className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีใบเสนอราคา</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            คุณสามารถขอใบเสนอราคาสำหรับทัวร์หรือคำขอพิเศษได้ที่นี่
          </p>
          <Link
            href="/member/quotations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-orange-600"
          >
            <PlusIcon className="w-4 h-4" />
            ขอใบเสนอราคาใหม่
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((q) => (
            <Link
              key={q.id}
              href={`/member/quotations/${q.id}`}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[var(--color-primary)] hover:shadow-sm transition"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-500">{q.quotation_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[q.status].color}`}>
                    {STATUS_BADGE[q.status].text}
                  </span>
                </div>
                <div className="font-medium text-gray-900 truncate">
                  {q.title || q.tour?.title || "ใบเสนอราคาทัวร์"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {q.pax_adult + q.pax_child + q.pax_infant} ท่าน · สร้าง {formatDate(q.created_at)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {Number(q.total_amount) > 0 && (
                  <div className="font-semibold text-gray-900">฿{formatMoney(q.total_amount)}</div>
                )}
                <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-auto mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
