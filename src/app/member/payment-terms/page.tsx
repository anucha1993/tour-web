"use client";

import { CreditCardIcon, BanknotesIcon, QrCodeIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

export default function PaymentTermsPage() {
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

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingLibraryIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">โอนผ่านธนาคาร</h3>
          </div>
          <p className="text-sm text-gray-600">
            โอนเงินผ่านบัญชีธนาคารและแจ้งสลิปการโอน
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <QrCodeIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">พร้อมเพย์ / QR Code</h3>
          </div>
          <p className="text-sm text-gray-600">
            สแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCardIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">บัตรเครดิต/เดบิต</h3>
          </div>
          <p className="text-sm text-gray-600">
            ชำระด้วยบัตร Visa, Mastercard, JCB (มีค่าธรรมเนียม 3%)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BanknotesIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">ผ่อนชำระ 0%</h3>
          </div>
          <p className="text-sm text-gray-600">
            ผ่อนชำระ 0% สูงสุด 10 เดือน (เฉพาะบัตรที่ร่วมรายการ)
          </p>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">บัญชีธนาคารสำหรับโอนเงิน</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              SCB
            </div>
            <div>
              <p className="font-medium text-gray-900">ธนาคารไทยพาณิชย์</p>
              <p className="text-sm text-gray-600">เลขบัญชี: xxx-x-xxxxx-x</p>
              <p className="text-sm text-gray-500">ชื่อบัญชี: บริษัท ตัวอย่าง จำกัด</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              KBANK
            </div>
            <div>
              <p className="font-medium text-gray-900">ธนาคารกสิกรไทย</p>
              <p className="text-sm text-gray-600">เลขบัญชี: xxx-x-xxxxx-x</p>
              <p className="text-sm text-gray-500">ชื่อบัญชี: บริษัท ตัวอย่าง จำกัด</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              BBL
            </div>
            <div>
              <p className="font-medium text-gray-900">ธนาคารกรุงเทพ</p>
              <p className="text-sm text-gray-600">เลขบัญชี: xxx-x-xxxxx-x</p>
              <p className="text-sm text-gray-500">ชื่อบัญชี: บริษัท ตัวอย่าง จำกัด</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">เงื่อนไขการชำระเงิน</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">1. เงินมัดจำ</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
              <li>ทัวร์ในประเทศ: มัดจำ 30% ของราคาทัวร์ หรือขั้นต่ำ 5,000 บาท/ท่าน</li>
              <li>ทัวร์ต่างประเทศ (เอเชีย): มัดจำ 50% ของราคาทัวร์ หรือขั้นต่ำ 10,000 บาท/ท่าน</li>
              <li>ทัวร์ต่างประเทศ (ยุโรป/อเมริกา): มัดจำ 50% ของราคาทัวร์ หรือขั้นต่ำ 20,000 บาท/ท่าน</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">2. ชำระส่วนที่เหลือ</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
              <li>ทัวร์ในประเทศ: ชำระก่อนเดินทางอย่างน้อย 7 วัน</li>
              <li>ทัวร์ต่างประเทศ: ชำระก่อนเดินทางอย่างน้อย 14 วัน</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">3. การแจ้งชำระเงิน</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
              <li>หลังจากโอนเงินกรุณาแจ้งสลิปการโอนผ่านระบบหรือทาง Line Official</li>
              <li>ระบุชื่อผู้จอง และรหัสการจองให้ชัดเจน</li>
              <li>เจ้าหน้าที่จะยืนยันการชำระเงินภายใน 24 ชั่วโมง (วันทำการ)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">4. การออกใบเสร็จ/ใบกำกับภาษี</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
              <li>ใบเสร็จรับเงินจะจัดส่งทางอีเมลภายใน 3 วันทำการหลังได้รับการชำระเงิน</li>
              <li>กรณีต้องการใบกำกับภาษี กรุณาแจ้งข้อมูลที่อยู่ก่อนทำการชำระเงิน</li>
              <li>ไม่สามารถเปลี่ยนแปลงข้อมูลใบกำกับภาษีได้หลังจากออกเอกสารแล้ว</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ หมายเหตุสำคัญ</h3>
            <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
              <li>กรุณาชำระเงินภายในเวลาที่กำหนด มิฉะนั้นการจองจะถูกยกเลิกโดยอัตโนมัติ</li>
              <li>ราคาทัวร์อาจมีการเปลี่ยนแปลงได้ตามอัตราแลกเปลี่ยน ณ วันที่ชำระเงิน</li>
              <li>การจองจะสมบูรณ์เมื่อได้รับการยืนยันจากเจ้าหน้าที่เท่านั้น</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>อัพเดทล่าสุด: 1 กุมภาพันธ์ 2569</p>
        </div>
      </div>
    </div>
  );
}
