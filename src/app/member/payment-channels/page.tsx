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

export default function PaymentChannelsPage() {
  const [content, setContent] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_URL}/web/page-content/payment_channels`);
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
<p class="text-gray-600 mb-6">ท่านสามารถชำระเงินผ่านช่องทางต่างๆ ดังนี้</p>

<h3 class="text-md font-semibold text-gray-900 mb-3">1. โอนเงินผ่านธนาคาร</h3>
<p class="text-gray-600 mb-4">โอนเงินเข้าบัญชีธนาคารของบริษัท</p>

<h3 class="text-md font-semibold text-gray-900 mb-3">2. บัตรเครดิต</h3>
<p class="text-gray-600 mb-4">รองรับ Visa, Mastercard, JCB</p>

<h3 class="text-md font-semibold text-gray-900 mb-3">3. QR Code / PromptPay</h3>
<p class="text-gray-600">สแกน QR Code ผ่าน Mobile Banking</p>`;
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
          <CreditCardIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            ช่องทางการชำระเงิน
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ช่องทางและวิธีการชำระเงิน
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
