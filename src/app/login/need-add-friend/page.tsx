'use client';

import Link from 'next/link';
import { MessageCircle, ArrowRight, Check } from 'lucide-react';
import { config } from '@/lib/config';

/**
 * Friend-gate landing page.
 *
 * Shown right after a successful LINE login when the user has NOT yet added
 * our LINE Official Account as a friend (friendFlag=false). Login already
 * succeeded — this simply nudges them to add the OA so we can send updates.
 */
export default function NeedAddFriendPage() {
  const addFriendUrl = config.lineOa.addFriendUrl;
  const lineId = config.lineOa.basicId;
  // LINE provides an official QR image for any basic-id OA.
  const qrUrl = `https://qr-official.line.me/gs/M_${encodeURIComponent(lineId.replace(/^@/, ''))}_GW.png`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#06C755]/10">
          <MessageCircle className="h-8 w-8 text-[#06C755]" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          เข้าสู่ระบบสำเร็จ 🎉
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          เพิ่มเราเป็นเพื่อนใน LINE เพื่อรับข่าวสารโปรโมชั่นทัวร์
          และรับสิทธิพิเศษก่อนใคร
        </p>

        {/* QR code */}
        <div className="my-6 flex justify-center">
          <div className="rounded-xl border border-gray-200 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`เพิ่มเพื่อน LINE ${lineId}`}
              className="h-40 w-40 object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mb-6 space-y-2 text-left">
          {[
            'รับแจ้งเตือนโปรโมชั่นและดีลพิเศษ',
            'สอบถามและจองทัวร์ได้สะดวก รวดเร็ว',
            'รับสิทธิพิเศษสำหรับสมาชิก',
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06C755]" />
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Add friend button */}
        <a
          href={addFriendUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#06C755] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#05b64e]"
        >
          <MessageCircle className="h-5 w-5" />
          เพิ่มเพื่อน {lineId}
        </a>

        {/* Skip */}
        <Link
          href="/member"
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
        >
          ข้ามไปก่อน เข้าสู่หน้าสมาชิก
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
