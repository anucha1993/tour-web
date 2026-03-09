'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nexttrip.world/api';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('ไม่พบ token สำหรับยืนยัน');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const res = await fetch(`${API_URL}/subscribers/confirm/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'ยืนยันอีเมลสำเร็จแล้ว!');
        } else if (res.status === 410 || data.message?.includes('หมดอายุ') || data.message?.includes('expire')) {
          setStatus('expired');
          setMessage(data.message || 'ลิงก์ยืนยันหมดอายุแล้ว กรุณาสมัครใหม่อีกครั้ง');
        } else {
          setStatus('error');
          setMessage(data.message || 'เกิดข้อผิดพลาด');
        }
      } catch {
        setStatus('error');
        setMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className={`p-8 text-center ${
          status === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
          status === 'expired' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
          status === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
          'bg-gradient-to-r from-blue-500 to-blue-600'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            {status === 'loading' && (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {status === 'success' && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'expired' && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className="text-xl font-bold text-white">
            {status === 'loading' && 'กำลังยืนยัน...'}
            {status === 'success' && 'ยืนยันสำเร็จ!'}
            {status === 'expired' && 'ลิงก์หมดอายุ'}
            {status === 'error' && 'เกิดข้อผิดพลาด'}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                คุณจะได้รับข่าวสาร โปรโมชั่น และทัวร์สุดพิเศษจาก NextTrip Holiday
              </p>

              {/* แนะนำสมัครสมาชิก */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 text-left">
                <h3 className="text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                  ⭐ สมัครสมาชิกเพื่อรับสิทธิพิเศษเพิ่มเติม!
                </h3>
                <ul className="text-xs text-gray-600 space-y-1 mb-3">
                  <li className="flex items-center gap-1.5">✅ จองทัวร์ได้สะดวกรวดเร็ว</li>
                  <li className="flex items-center gap-1.5">✅ ติดตามสถานะการจองได้ตลอด</li>
                  <li className="flex items-center gap-1.5">✅ รับส่วนลดพิเศษสำหรับสมาชิก</li>
                  <li className="flex items-center gap-1.5">✅ บันทึกทัวร์โปรดและเขียนรีวิว</li>
                </ul>
                <Link
                  href="/member/register"
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-lg font-medium transition-all text-sm w-full justify-center"
                >
                  🎉 สมัครสมาชิกฟรี
                </Link>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                🏠 กลับหน้าหลัก
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                ลิงก์ยืนยันมีอายุ 24 ชั่วโมง — กรุณากรอกอีเมลที่หน้าเว็บอีกครั้งเพื่อรับลิงก์ใหม่
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                สมัครอีกครั้ง
              </Link>
            </div>
          )}

          {status === 'error' && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} NextTrip Holiday — nexttripholiday.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscribeConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
