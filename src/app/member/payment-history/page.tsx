"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Mockup Data
const mockPayments = [
  {
    id: 1,
    payment_number: "PAY2024020001",
    booking_number: "BK2024020001",
    tour_name: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ 6 วัน 4 คืน",
    amount: 45900,
    payment_method: "โอนผ่านธนาคาร",
    payment_type: "มัดจำ",
    status: "completed",
    status_label: "ชำระแล้ว",
    paid_at: "2024-02-01T10:30:00Z",
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: 2,
    payment_number: "PAY2024020002",
    booking_number: "BK2024020001",
    tour_name: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ 6 วัน 4 คืน",
    amount: 45900,
    payment_method: "บัตรเครดิต",
    payment_type: "ส่วนที่เหลือ",
    status: "pending",
    status_label: "รอชำระ",
    due_date: "2024-03-01",
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: 3,
    payment_number: "PAY2024020003",
    booking_number: "BK2024020002",
    tour_name: "ทัวร์เกาหลี โซล เกาะนามิ 5 วัน 3 คืน",
    amount: 51800,
    payment_method: "โอนผ่านธนาคาร",
    payment_type: "มัดจำ",
    status: "completed",
    status_label: "ชำระแล้ว",
    paid_at: "2024-01-28T15:00:00Z",
    created_at: "2024-01-28T14:30:00Z",
  },
  {
    id: 4,
    payment_number: "PAY2024010004",
    booking_number: "BK2024010003",
    tour_name: "ทัวร์เวียดนาม ดานัง ฮอยอัน 4 วัน 3 คืน",
    amount: 25800,
    payment_method: "บัตรเครดิต",
    payment_type: "เต็มจำนวน",
    status: "completed",
    status_label: "ชำระแล้ว",
    paid_at: "2024-01-05T10:00:00Z",
    created_at: "2024-01-05T09:15:00Z",
  },
  {
    id: 5,
    payment_number: "PAY2024010005",
    booking_number: "BK2024010004",
    tour_name: "ทัวร์สิงคโปร์ 3 วัน 2 คืน",
    amount: 15800,
    payment_method: "โอนผ่านธนาคาร",
    payment_type: "มัดจำ",
    status: "cancelled",
    status_label: "ยกเลิก",
    created_at: "2024-01-02T11:00:00Z",
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: typeof CheckCircleIcon }> = {
  completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon },
};

export default function MemberPaymentHistory() {
  const { member } = useAuth();
  const [payments] = useState(mockPayments);
  const [filter, setFilter] = useState<string>("all");

  if (!member) return null;

  const filteredPayments = filter === "all" 
    ? payments 
    : payments.filter(p => p.status === filter);

  const totalPaid = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ประวัติการชำระเงิน</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Mockup</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{payments.length} รายการ</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700">ชำระแล้ว</p>
              <p className="text-lg font-bold text-green-800">
                ฿{totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-700">รอชำระ</p>
              <p className="text-lg font-bold text-yellow-800">
                ฿{totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">รายการทั้งหมด</p>
              <p className="text-lg font-bold text-blue-800">
                {payments.length} รายการ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: "all", label: "ทั้งหมด" },
          { value: "completed", label: "ชำระแล้ว" },
          { value: "pending", label: "รอชำระ" },
          { value: "cancelled", label: "ยกเลิก" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${filter === tab.value
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BanknotesIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบรายการชำระเงิน</h3>
          <p className="text-gray-500">ไม่มีรายการที่ตรงกับเงื่อนไขที่เลือก</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => {
            const statusStyle = statusColors[payment.status] || statusColors.pending;
            const StatusIcon = statusStyle.icon;
            
            return (
              <div
                key={payment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 lg:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Payment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BanknotesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {payment.payment_number}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {payment.status_label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {payment.tour_name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <DocumentTextIcon className="w-4 h-4" />
                              {payment.booking_number}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCardIcon className="w-4 h-4" />
                              {payment.payment_method}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 lg:gap-1 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">{payment.payment_type}</span>
                        <span className="text-lg font-bold text-gray-900">
                          ฿{payment.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {payment.paid_at 
                            ? new Date(payment.paid_at).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : payment.due_date 
                              ? `กำหนดชำระ ${new Date(payment.due_date).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}`
                              : "-"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button for Pending Payments */}
                {payment.status === "pending" && (
                  <div className="px-4 lg:px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <button className="w-full lg:w-auto px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                      ชำระเงิน
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
