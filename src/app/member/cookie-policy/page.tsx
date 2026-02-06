"use client";

import { useState, useEffect } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { API_URL } from "@/lib/config";

interface PageContent {
  key: string;
  title: string;
  description: string;
  content: string;
  updated_at: string | null;
}

export default function CookiePolicyPage() {
  const [content, setContent] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
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
  };

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

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            นโยบายคุกกี้
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            การใช้งานคุกกี้และการติดตามข้อมูล
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <div 
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {updatedAt && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>อัพเดทล่าสุด: {new Date(updatedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
