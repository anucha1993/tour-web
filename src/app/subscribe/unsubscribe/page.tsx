'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nexttrip.asia/api';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('ไม่พบ token สำหรับยกเลิกการสมัคร');
      return;
    }

    const doUnsubscribe = async () => {
      try {
        const res = await fetch(`${API_URL}/subscribers/unsubscribe/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'ยกเลิกการรับข่าวสารสำเร็จแล้ว');
        } else {
          setStatus('error');
          setMessage(data.message || 'เกิดข้อผิดพลาด');
        }
      } catch {
        setStatus('error');
        setMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    };

    doUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className={`p-8 text-center ${
          status === 'success' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
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
            {status === 'error' && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className="text-xl font-bold text-white">
            {status === 'loading' && 'กำลังดำเนินการ...'}
            {status === 'success' && 'ยกเลิกสำเร็จ'}
            {status === 'error' && 'เกิดข้อผิดพลาด'}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                คุณจะไม่ได้รับอีเมลจาก NextTrip Holiday อีกต่อไป
                <br />หากต้องการสมัครอีกครั้ง สามารถกรอกอีเมลที่หน้าเว็บได้เลย
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🏠 กลับหน้าหลัก
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

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
