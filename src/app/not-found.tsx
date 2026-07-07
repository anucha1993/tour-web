import Link from "next/link";
import { Home, Search, Compass } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ไม่พบหน้าที่คุณค้นหา (404)",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-100)]">
          <Compass className="h-10 w-10 text-[var(--color-primary)]" />
        </div>

        <p className="text-6xl font-extrabold text-[var(--color-primary)] sm:text-7xl">404</p>
        <h1 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
          ไม่พบหน้าที่คุณค้นหา
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          หน้านี้อาจถูกย้าย ลบ หรือลิงก์ไม่ถูกต้อง ลองกลับไปหน้าแรกหรือค้นหาทัวร์ที่คุณสนใจได้เลย
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
          <Link
            href="/tours/international"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Search className="h-4 w-4" />
            ดูทัวร์ทั้งหมด
          </Link>
        </div>
      </div>
    </div>
  );
}
