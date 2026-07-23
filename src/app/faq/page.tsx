import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { fetchOrganizationData } from "@/lib/organization";
import { buildFaqJsonLd, jsonLdString } from "@/lib/structured-data";

// Revalidate the admin-managed FAQ content every 5 minutes.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("faq", {
    path: "/faq",
    title: "คำถามที่พบบ่อยเกี่ยวกับการจองทัวร์",
    description:
      "รวมคำถามที่พบบ่อยเกี่ยวกับการจองทัวร์ การชำระเงิน เอกสารการเดินทาง และบริการของ Next Trip Holiday",
  });
}

export default async function FaqPage() {
  const data = await fetchOrganizationData();
  const faqs = (data?.faqs || []).filter(
    (f) => f?.question?.trim() && f?.answer?.trim()
  );
  const faqSchema = buildFaqJsonLd(faqs);

  return (
    <>
      {/* FAQPage structured data — lives on this page because the FAQ content
          is visibly rendered here (Google guideline). */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="breadcrumb">
          <Link href="/" className="hover:text-blue-600">
            หน้าแรก
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">คำถามที่พบบ่อย</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-blue-50 p-3">
            <MessageCircleQuestion className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            คำถามที่พบบ่อย (FAQ)
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            รวมคำถามที่ลูกค้าสอบถามบ่อยเกี่ยวกับการจองทัวร์ การชำระเงิน
            และบริการของเรา หากไม่พบคำตอบที่ต้องการ สามารถ
            <Link href="/contact" className="mx-1 text-blue-600 hover:underline">
              ติดต่อเรา
            </Link>
            ได้โดยตรง
          </p>
        </header>

        {faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-200 bg-white open:border-blue-200 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                  <span>{f.question}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="whitespace-pre-line border-t border-gray-100 p-4 pt-3 text-gray-600">
                  {f.answer}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
            ยังไม่มีคำถามที่พบบ่อยในขณะนี้ หากมีข้อสงสัยสามารถ
            <Link href="/contact" className="mx-1 text-blue-600 hover:underline">
              ติดต่อเรา
            </Link>
            ได้เลย
          </div>
        )}
      </div>
    </>
  );
}
