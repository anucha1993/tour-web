"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { API_URL } from "@/lib/config";

const getDefaultContent = () => {
  return `<h2 class="text-lg font-semibold text-gray-900 mb-4">1. คุกกี้คืออะไร</h2>
<p class="text-gray-600 mb-6">คุกกี้คือไฟล์ข้อมูลขนาดเล็กที่ถูกจัดเก็บไว้ในอุปกรณ์ของท่านเมื่อเข้าชมเว็บไซต์ คุกกี้ช่วยให้เว็บไซต์จดจำข้อมูลการเข้าชมของท่าน เพื่อให้การใช้งานครั้งถัดไปสะดวกและรวดเร็วขึ้น</p>

<h2 class="text-lg font-semibold text-gray-900 mb-4">2. ประเภทของคุกกี้ที่เราใช้</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li><strong>คุกกี้ที่จำเป็น (Essential Cookies)</strong> - จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์</li>
<li><strong>คุกกี้เพื่อการวิเคราะห์ (Analytics Cookies)</strong> - ช่วยให้เราเข้าใจว่าผู้เข้าชมใช้งานเว็บไซต์อย่างไร</li>
<li><strong>คุกกี้เพื่อการตลาด (Marketing Cookies)</strong> - ใช้เพื่อแสดงโฆษณาที่เกี่ยวข้องกับความสนใจของท่าน</li>
<li><strong>คุกกี้เพื่อการใช้งาน (Functional Cookies)</strong> - จดจำการตั้งค่าและความชอบของท่าน</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">3. การจัดการคุกกี้</h2>
<p class="text-gray-600 mb-6">ท่านสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ทั้งหมดหรือบางส่วนได้ อย่างไรก็ตาม การปิดคุกกี้อาจทำให้บางฟีเจอร์ของเว็บไซต์ไม่สามารถทำงานได้อย่างเต็มประสิทธิภาพ</p>

<h2 class="text-lg font-semibold text-gray-900 mb-4">4. การเปลี่ยนแปลงนโยบาย</h2>
<p class="text-gray-600 mb-6">เราอาจปรับปรุงนโยบายคุกกี้นี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลทันทีเมื่อประกาศบนเว็บไซต์</p>

<h2 class="text-lg font-semibold text-gray-900 mb-4">5. ติดต่อเรา</h2>
<p class="text-gray-600">หากท่านมีคำถามเกี่ยวกับนโยบายคุกกี้ สามารถติดต่อเราได้ทางช่องทางที่ระบุไว้ในเว็บไซต์</p>`;
};

export default function CookiePolicyPage() {
  const [content, setContent] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/web/page-content/cookie_policy`);
      const data = await response.json();
      if (data.success && data.data) {
        setContent(data.data.content || getDefaultContent());
        setUpdatedAt(data.data.updated_at);
      } else {
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
              <div className="space-y-6">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      {/* <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-600">
              หน้าแรก
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">นโยบายคุกกี้</span>
          </nav>
        </div>
      </div> */}

      <div className="container-custom py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-100 rounded-xl">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                นโยบายคุกกี้
              </h1>
              <p className="text-gray-500 mt-1">
                การใช้งานคุกกี้และการติดตามข้อมูล
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {updatedAt && (
              <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <p>อัพเดทล่าสุด: {new Date(updatedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="mt-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

