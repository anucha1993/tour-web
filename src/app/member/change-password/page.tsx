"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { 
  KeyIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

export default function ChangePassword() {
  const router = useRouter();
  const { member, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !member) {
      router.push("/login");
    }
  }, [member, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return checks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Validate
    if (formData.new_password !== formData.new_password_confirmation) {
      setMessage({ type: "error", text: "รหัสผ่านใหม่ไม่ตรงกัน" });
      setIsSubmitting(false);
      return;
    }

    const checks = validatePassword(formData.new_password);
    if (!Object.values(checks).every(Boolean)) {
      setMessage({ type: "error", text: "รหัสผ่านใหม่ไม่ตรงตามเงื่อนไข" });
      setIsSubmitting(false);
      return;
    }

    try {
      await authApi.changePassword(formData);
      setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordChecks = validatePassword(formData.new_password);

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
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/member"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Icon Section */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <KeyIcon className="w-10 h-10 text-white" />
            </div>
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

            {/* Current Password */}
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่านปัจจุบัน
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="รหัสผ่านปัจจุบัน"
                />
                <button
                  type="button"
                  onClick={() => togglePassword("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="รหัสผ่านใหม่"
                />
                <button
                  type="button"
                  onClick={() => togglePassword("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.new_password && (
                <div className="mt-3 space-y-1">
                  <p className={`text-xs flex items-center gap-1 ${passwordChecks.length ? "text-green-600" : "text-gray-500"}`}>
                    {passwordChecks.length ? "✓" : "○"} อย่างน้อย 8 ตัวอักษร
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${passwordChecks.uppercase ? "text-green-600" : "text-gray-500"}`}>
                    {passwordChecks.uppercase ? "✓" : "○"} มีตัวพิมพ์ใหญ่ (A-Z)
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${passwordChecks.lowercase ? "text-green-600" : "text-gray-500"}`}>
                    {passwordChecks.lowercase ? "✓" : "○"} มีตัวพิมพ์เล็ก (a-z)
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${passwordChecks.number ? "text-green-600" : "text-gray-500"}`}>
                    {passwordChecks.number ? "✓" : "○"} มีตัวเลข (0-9)
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${passwordChecks.special ? "text-green-600" : "text-gray-500"}`}>
                    {passwordChecks.special ? "✓" : "○"} มีอักขระพิเศษ (!@#$%...)
                  </p>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                />
                <button
                  type="button"
                  onClick={() => togglePassword("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.new_password_confirmation && formData.new_password !== formData.new_password_confirmation && (
                <p className="text-xs text-red-500 mt-1">รหัสผ่านไม่ตรงกัน</p>
              )}
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
                  กำลังเปลี่ยนรหัสผ่าน...
                </span>
              ) : (
                "เปลี่ยนรหัสผ่าน"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
