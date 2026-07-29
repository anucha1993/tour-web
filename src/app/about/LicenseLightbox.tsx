'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Interactive TAT license image with click-to-zoom lightbox.
 * Extracted as a small client component so the rest of the About page can
 * render on the server (SEO: content is present in the initial HTML).
 */
export default function LicenseLightbox({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        ใบอนุญาตประกอบกิจการท่องเที่ยว
      </h3>
      <div
        className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt="ใบอนุญาตประกอบกิจการท่องเที่ยว"
          width={300}
          height={250}
          className="object-contain"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
          <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
            คลิกเพื่อขยาย
          </span>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm font-medium"
            >
              ✕ ปิด
            </button>
            <Image
              src={src}
              alt="ใบอนุญาตประกอบกิจการท่องเที่ยว"
              width={900}
              height={1200}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
