"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertTriangle } from "lucide-react";

/**
 * Route-level error boundary. Catches render/data errors in page segments
 * and offers a retry without a full reload.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging (and any wired-up error reporting).
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          เกิดข้อผิดพลาดบางอย่าง
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          ขออภัยในความไม่สะดวก ระบบเกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่อีกครั้ง
        </p>
        {error?.digest && (
          <p className="mt-1 text-xs text-gray-400">รหัสอ้างอิง: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            <RotateCcw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
