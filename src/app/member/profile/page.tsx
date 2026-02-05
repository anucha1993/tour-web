"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function MemberProfile() {
  const { member, refreshMember } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    line_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        line_id: member.line_id || "",
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await authApi.updateProfile(formData);
      if (response.success) {
        await refreshMember();
        setMessage({ type: "success", text: "บันทึกข้อมูลเรียบร้อยแล้ว" });
      } else {
        setMessage({ type: "error", text: response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!member) {
    return null;
  }

  return (

    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <UserIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h1>
          <p className="text-sm text-gray-500">จัดการข้อมูลบัญชีของคุณ</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 mb-1 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-1" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-1" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white max-w-5xl rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">ข้อมูลบัญชี</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{member.phone}</span>
              </div>
              {member.is_verified && (
                <span className="inline-flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircleIcon className="w-4 h-4" />
                  ยืนยันตัวตนแล้ว
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * ไม่สามารถเปลี่ยนเบอร์โทรศัพท์ได้ เนื่องจากใช้ในการยืนยันตัวตน
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white max-w-5xl mx-au rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 ">
          <h2 className="font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่อ
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                placeholder="ชื่อ"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                นามสกุล
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                placeholder="นามสกุล"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                อีเมล
              </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
              placeholder="example@email.com"
            />
          </div>

          {/* LINE ID */}
          <div>
            <label htmlFor="line_id" className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                LINE ID
              </span>
            </label>
            <input
              type="text"
              id="line_id"
              name="line_id"
              value={formData.line_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
              placeholder="@lineid หรือ lineid"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                กำลังบันทึก...
              </span>
            ) : (
              "บันทึกข้อมูล"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
