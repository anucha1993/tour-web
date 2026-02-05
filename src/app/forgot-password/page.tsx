'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await authApi.forgotPassword(email);
    
    if (response.success) {
      setIsSubmitted(true);
    } else {
      setError(response.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ตรวจสอบอีเมลของคุณ
              </h2>
              <p className="text-gray-600 mb-6">
                หากอีเมล <span className="font-medium">{email}</span> มีอยู่ในระบบ 
                เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปแล้ว
              </p>
              <p className="text-sm text-gray-500 mb-6">
                กรุณาตรวจสอบกล่องจดหมาย (รวมถึงโฟลเดอร์สแปม)
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          ลืมรหัสผ่าน
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่าน
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  ส่งลิงก์รีเซ็ตรหัสผ่าน
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
