"use client";

import { useState, useEffect } from "react";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import { API_URL } from "@/lib/config";

interface PageContent {
  key: string;
  title: string;
  description: string;
  content: string;
  updated_at: string | null;
}

export default function TermsPage() {
  const [content, setContent] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_URL}/web/page-content/terms`);
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
    return `<h2 class="text-lg font-semibold text-gray-900 mb-4">1. ข้อตกลงทั่วไป</h2>
<p class="text-gray-600 mb-6">การใช้บริการของเว็บไซต์นี้ ถือว่าท่านได้ยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขการให้บริการทั้งหมด
โดยเราขอสงวนสิทธิ์ในการแก้ไขเปลี่ยนแปลงเงื่อนไขการให้บริการได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>

<h2 class="text-lg font-semibold text-gray-900 mb-4">2. การจองทัวร์</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>การจองทัวร์จะสมบูรณ์เมื่อได้รับการยืนยันจากเจ้าหน้าที่และชำระเงินมัดจำตามที่กำหนด</li>
<li>ราคาทัวร์ที่แสดงอาจมีการเปลี่ยนแปลงได้ตามสภาวะตลาดและอัตราแลกเปลี่ยน</li>
<li>จำนวนที่นั่งมีจำกัด ขอสงวนสิทธิ์สำหรับผู้ที่ชำระเงินก่อน</li>
<li>เอกสารการเดินทางต้องมีอายุการใช้งานไม่น้อยกว่า 6 เดือนนับจากวันเดินทาง</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">3. การยกเลิกและการเปลี่ยนแปลง</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>การยกเลิกการจองต้องแจ้งเป็นลายลักษณ์อักษรเท่านั้น</li>
<li>กรณียกเลิกก่อนเดินทาง 30 วัน คืนเงินเต็มจำนวน (หักค่าธรรมเนียมธนาคาร)</li>
<li>กรณียกเลิกก่อนเดินทาง 15-29 วัน หักค่ามัดจำ 50%</li>
<li>กรณียกเลิกก่อนเดินทาง 7-14 วัน หักค่าใช้จ่าย 75%</li>
<li>กรณียกเลิกน้อยกว่า 7 วัน ไม่สามารถคืนเงินได้</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">4. ความรับผิดชอบ</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>บริษัทจะไม่รับผิดชอบต่อความล่าช้าหรือการเปลี่ยนแปลงที่เกิดจากสายการบิน, สภาพอากาศ หรือเหตุสุดวิสัย</li>
<li>บริษัทจะไม่รับผิดชอบต่อทรัพย์สินส่วนตัวของลูกค้าที่สูญหายหรือเสียหายระหว่างการเดินทาง</li>
<li>ลูกค้าควรทำประกันการเดินทางเพิ่มเติมตามความเหมาะสม</li>
</ul>

<h2 class="text-lg font-semibold text-gray-900 mb-4">5. การติดต่อ</h2>
<p class="text-gray-600">หากท่านมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเราได้ทางช่องทางที่ระบุไว้ในเว็บไซต์</p>`;
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
          <DocumentCheckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            เงื่อนไขการให้บริการ
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ข้อกำหนดและเงื่อนไขการใช้บริการ
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
