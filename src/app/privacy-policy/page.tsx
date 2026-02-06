"use client";

import { useState, useEffect } from "react";
import { ShieldExclamationIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { API_URL } from "@/lib/config";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_URL}/web/page-content/privacy_policy`);
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
    return `<h2 class="text-lg font-semibold text-gray-900 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
<p class="text-gray-600 mb-4">เราเก็บรวบรวมข้อมูลส่วนบุคคลเมื่อท่านลงทะเบียน สั่งซื้อสินค้าหรือบริการ หรือติดต่อเรา ซึ่งรวมถึง:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>ชื่อ-นามสกุล และข้อมูลติดต่อ</li>
<li>ข้อมูลการชำระเงิน</li>
<li>ข้อมูลการเดินทาง (หนังสือเดินทาง, วีซ่า)</li>
<li>ข้อมูลการใช้งานเว็บไซต์</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>ดำเนินการจองและให้บริการทัวร์</li>
<li>ติดต่อสื่อสารเกี่ยวกับการจอง</li>
<li>ส่งข้อมูลโปรโมชั่นและข่าวสาร (เมื่อได้รับความยินยอม)</li>
<li>ปรับปรุงบริการและประสบการณ์ผู้ใช้</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">3. การเปิดเผยข้อมูล</h2>
<p class="text-gray-600 mb-4">เราอาจเปิดเผยข้อมูลของท่านต่อบุคคลที่สามเฉพาะในกรณี:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>สายการบิน โรงแรม และผู้ให้บริการที่เกี่ยวข้องกับการเดินทาง</li>
<li>หน่วยงานราชการตามที่กฎหมายกำหนด</li>
<li>ผู้ให้บริการที่ช่วยเหลือในการดำเนินธุรกิจ</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">4. สิทธิ์ของท่าน</h2>
<p class="text-gray-600 mb-4">ท่านมีสิทธิ์ในการ:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>เข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
<li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
<li>ขอลบข้อมูล (ภายใต้เงื่อนไขที่กำหนด)</li>
<li>ถอนความยินยอม</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">5. การรักษาความปลอดภัย</h2>
<p class="text-gray-600 mb-6">เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของท่านจากการเข้าถึง การใช้ หรือการเปิดเผยโดยไม่ได้รับอนุญาต</p>

<h2 class="text-lg font-semibold text-gray-900 mb-4">6. ติดต่อเรา</h2>
<p class="text-gray-600">หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อเราได้ทางช่องทางที่ระบุไว้ในเว็บไซต์</p>`;
  };

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
            <span className="text-gray-900">นโยบายความเป็นส่วนตัว</span>
          </nav>
        </div>
      </div> */}

      <div className="container-custom py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-purple-100 rounded-xl">
              <ShieldExclamationIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                นโยบายความเป็นส่วนตัว
              </h1>
              <p className="text-gray-500 mt-1">
                การคุ้มครองข้อมูลส่วนบุคคลของท่าน
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
