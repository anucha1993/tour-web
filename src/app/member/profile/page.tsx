"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { 
  UserIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function MemberProfile() {
  const router = useRouter();
  const { member, isLoading: authLoading, refreshMember } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    line_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !member) {
      router.push("/login");
    }
  }, [member, authLoading, router]);

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
      await authApi.updateProfile(formData);
      await refreshMember();
      setMessage({ type: "success", text: "บันทึกข้อมูลเรียบร้อยแล้ว" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/member"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">ข้อมูลส่วนตัว</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <p className="text-white font-medium">{member.phone}</p>
            {member.is_verified && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                ยืนยันแล้ว
              </span>
            )}
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Phone (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                value={member.phone}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนเบอร์โทรศัพท์ได้</p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="ชื่อ"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="นามสกุล"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="example@email.com"
              />
            </div>

            {/* LINE ID */}
            <div>
              <label htmlFor="line_id" className="block text-sm font-medium text-gray-700 mb-2">
                LINE ID
              </label>
              <input
                type="text"
                id="line_id"
                name="line_id"
                value={formData.line_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="@lineid หรือ lineid"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        </div>
      </div>
    </div>
  );
}
