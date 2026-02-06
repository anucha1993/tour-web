"use client";

import { useState, useEffect } from "react";
import { BanknotesIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { API_URL } from "@/lib/config";

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
            <span className="text-gray-900">ช่องทางการชำระเงิน</span>
          </nav>
        </div>
      </div> */}

      <div className="container-custom py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-orange-100 rounded-xl">
              <BanknotesIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                ช่องทางการชำระเงิน
              </h1>
              <p className="text-gray-500 mt-1">
                ช่องทางและวิธีการชำระเงิน
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
