"use client";

import { useState } from "react";
import { TrashIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { API_URL, SITE_NAME } from "@/lib/config";

export default function DataDeletionPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line_id: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError("กรุณากรอกชื่อและอย่างน้อย 1 ช่องทาง (อีเมล หรือ เบอร์โทร)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || `${form.phone.trim()}@no-email.local`,
          phone: form.phone.trim(),
          subject: "[คำขอลบข้อมูลส่วนบุคคล] " + form.name.trim(),
          message:
            `คำขอลบข้อมูลส่วนบุคคล\n` +
            `ชื่อ: ${form.name}\n` +
            `อีเมล: ${form.email || "-"}\n` +
            `เบอร์โทร: ${form.phone || "-"}\n` +
            `LINE ID: ${form.line_id || "-"}\n` +
            `เหตุผล: ${form.reason || "-"}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === undefined || data.success)) {
        setSubmitted(true);
      } else {
        setError(data.message || "ไม่สามารถส่งคำขอได้ กรุณาลองใหม่หรือติดต่อโดยตรง");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่หรือติดต่อโดยตรง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-red-100 rounded-xl">
              <TrashIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                คำขอลบข้อมูลส่วนบุคคล
              </h1>
              <p className="text-gray-500 mt-1">
                Data Deletion Request — {SITE_NAME}
              </p>
            </div>
          </div>

          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">สิทธิ์ในการลบข้อมูลของท่าน</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ท่านมีสิทธิ์ขอให้
              {" "}{SITE_NAME}{" "}
              ลบข้อมูลส่วนบุคคลของท่านออกจากระบบของเรา
              รวมถึงข้อมูลที่ได้รับผ่านบริการของบุคคลที่สาม เช่น LINE Login หรือ Facebook Login
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong className="text-gray-900">หมายเหตุ:</strong>{" "}
              ข้อมูลบางส่วนอาจถูกเก็บรักษาไว้ตามที่กฎหมายกำหนด เช่น
              เอกสารทางการเงินและการจองทัวร์ที่ดำเนินการแล้ว
              เราจะลบเฉพาะข้อมูลที่ไม่ได้อยู่ภายใต้ข้อบังคับการเก็บรักษาตามกฎหมาย
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลที่จะถูกลบ</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>บัญชีสมาชิกและข้อมูลโปรไฟล์ (ชื่อ, อีเมล, เบอร์โทร, รูปภาพ)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>ข้อมูลที่ได้รับจาก LINE / Facebook Login (Provider ID, Display Name, Email)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>รายการทัวร์ที่ชอบ (Favorites) และประวัติการค้นหา</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>การสมัครรับข่าวสารและโปรโมชั่น</span>
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">ระยะเวลาดำเนินการ</h2>
            <p className="text-gray-600">
              ทีมงานจะดำเนินการตรวจสอบและลบข้อมูลภายใน{" "}
              <strong className="text-gray-900">7–30 วันทำการ</strong>{" "}
              นับจากวันที่ได้รับคำขอ และจะแจ้งผลกลับทางอีเมล/เบอร์โทรที่ระบุไว้
            </p>
          </div>

          {/* Contact Channels */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ช่องทางการแจ้งลบข้อมูล</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="mailto:nexttripholiday@gmail.com?subject=คำขอลบข้อมูลส่วนบุคคล"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">อีเมล</div>
                  <div className="text-gray-500 text-xs">nexttripholiday@gmail.com</div>
                </div>
              </a>
              <a
                href="tel:0910916364"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition"
              >
                <PhoneIcon className="w-5 h-5 text-green-500" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">โทรศัพท์</div>
                  <div className="text-gray-500 text-xs">091-091-6364</div>
                </div>
              </a>
              <a
                href="https://lin.ee/XKyOlQ0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-500" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">LINE</div>
                  <div className="text-gray-500 text-xs">@nexttrip</div>
                </div>
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">หรือกรอกแบบฟอร์มแจ้งคำขอ</h2>
            <p className="text-sm text-gray-500 mb-6">
              ส่งคำขอผ่านหน้านี้ได้โดยตรง ทีมงานจะตอบกลับภายใน 7 วันทำการ
            </p>

            {submitted ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900">ส่งคำขอเรียบร้อยแล้ว</div>
                  <div className="text-sm text-green-700 mt-1">
                    เราได้รับคำขอลบข้อมูลของท่านแล้ว
                    ทีมงานจะติดต่อกลับเพื่อยืนยันตัวตนภายใน 7 วันทำการ
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ชื่อตามที่ลงทะเบียนในระบบ"
                    required
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">อีเมล</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com"
                      className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0XX-XXX-XXXX"
                      className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">LINE User ID หรือ Display Name (ถ้ามี)</label>
                  <input
                    type="text"
                    value={form.line_id}
                    onChange={(e) => setForm({ ...form, line_id: e.target.value })}
                    placeholder="กรณีสมัครผ่าน LINE Login"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">เหตุผล (ไม่บังคับ)</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    rows={3}
                    placeholder="เหตุผลที่ต้องการลบข้อมูล (ช่วยให้เราปรับปรุงบริการ)"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition resize-none"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  เพื่อความปลอดภัย ทีมงานจะติดต่อกลับเพื่อยืนยันตัวตนก่อนดำเนินการลบข้อมูล
                </p>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอลบข้อมูล"}
                </button>
              </form>
            )}
          </div>

          {/* Related links */}
          <div className="mt-8 text-sm text-gray-500 text-center space-x-4">
            <Link href="/privacy-policy" className="hover:text-blue-600 underline">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="hover:text-blue-600 underline">
              เงื่อนไขการให้บริการ
            </Link>
            <Link href="/contact" className="hover:text-blue-600 underline">
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
