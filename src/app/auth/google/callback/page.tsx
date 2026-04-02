'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithSocial, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/member');
      return;
    }
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    if (!code) {
      requestAnimationFrame(() => setError('ไม่ได้รับ authorization code จาก Google'));
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;

    loginWithSocial('google', code, redirectUri).then((result) => {
      if (result.success) {
        router.push('/member');
      } else {
        setError(result.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      }
    });
  }, [searchParams, loginWithSocial, router, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <a href="/login" className="text-sm text-blue-600 hover:underline">กลับไปหน้าเข้าสู่ระบบ</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600">กำลังเข้าสู่ระบบด้วย Google...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
