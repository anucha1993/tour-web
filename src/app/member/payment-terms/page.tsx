"use client";

import { useState, useEffect } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";

interface PageContent {
  key: string;
  title: string;
  description: string;
  content: string;
  updated_at: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.nexttrip.asia/api";

export default function PaymentTermsPage() {
  const [content, setContent] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_URL}/web/page-content/payment_terms`);
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
    return `<h2 class="text-lg font-semibold text-gray-900 mb-4">ช่องทางการชำระเงิน</h2>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="font-medium text-gray-900 mb-2">โอนผ่านธนาคาร</h3>
    <p class="text-sm text-gray-600">โอนเงินผ่านบัญชีธนาคารและแจ้งสลิปการโอน</p>
  </div>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="font-medium text-gray-900 mb-2">พร้อมเพย์ / QR Code</h3>
    <p class="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking</p>
  </div>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="font-medium text-gray-900 mb-2">บัตรเครดิต/เดบิต</h3>
    <p class="text-sm text-gray-600">ชำระด้วยบัตร Visa, Mastercard, JCB (มีค่าธรรมเนียม 3%)</p>
  </div>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="font-medium text-gray-900 mb-2">ผ่อนชำระ 0%</h3>
    <p class="text-sm text-gray-600">ผ่อนชำระ 0% สูงสุด 10 เดือน (เฉพาะบัตรที่ร่วมรายการ)</p>
  </div>
</div>

<h2 class="text-lg font-semibold text-gray-900 mb-4">บัญชีธนาคารสำหรับโอนเงิน</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
  <li><strong>ธนาคารไทยพาณิชย์</strong> - เลขบัญชี: xxx-x-xxxxx-x - ชื่อบัญชี: บริษัท ตัวอย่าง จำกัด</li>
  <li><strong>ธนาคารกสิกรไทย</strong> - เลขบัญชี: xxx-x-xxxxx-x - ชื่อบัญชี: บริษัท ตัวอย่าง จำกัด</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">เงื่อนไขการชำระเงิน</h2>

<h3 class="font-medium text-gray-900 mb-2">1. เงินมัดจำ</h3>
<ul class="list-disc list-inside text-gray-600 mb-4 space-y-1">
  <li>ทัวร์ในประเทศ: มัดจำ 30% ของราคาทัวร์ หรือขั้นต่ำ 5,000 บาท/ท่าน</li>
  <li>ทัวร์ต่างประเทศ (เอเชีย): มัดจำ 50% ของราคาทัวร์ หรือขั้นต่ำ 10,000 บาท/ท่าน</li>
  <li>ทัวร์ต่างประเทศ (ยุโรป/อเมริกา): มัดจำ 50% ของราคาทัวร์ หรือขั้นต่ำ 20,000 บาท/ท่าน</li>
</ul>

<h3 class="font-medium text-gray-900 mb-2">2. ชำระส่วนที่เหลือ</h3>
<ul class="list-disc list-inside text-gray-600 mb-4 space-y-1">
  <li>ทัวร์ในประเทศ: ชำระก่อนเดินทางอย่างน้อย 7 วัน</li>
  <li>ทัวร์ต่างประเทศ: ชำระก่อนเดินทางอย่างน้อย 14 วัน</li>
</ul>

<h3 class="font-medium text-gray-900 mb-2">3. การแจ้งชำระเงิน</h3>
<ul class="list-disc list-inside text-gray-600 space-y-1">
  <li>หลังจากโอนเงินกรุณาแจ้งสลิปการโอนผ่านระบบหรือทาง Line Official</li>
  <li>ระบุชื่อผู้จอง และรหัสการจองให้ชัดเจน</li>
  <li>เจ้าหน้าที่จะยืนยันการชำระเงินภายใน 24 ชั่วโมง (วันทำการ)</li>
</ul>`;
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-xl">
          <CreditCardIcon className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            เงื่อนไขชำระเงิน
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ช่องทางและเงื่อนไขการชำระเงิน
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
