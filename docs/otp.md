
โอเคร ต่อมาเรามาทำระบบ สมัครสมาชิก หน้าweb พร้อมส่ง api ข้อมูลไปยัง tour-api  ให้ tour-api จัดการสมาชิก ได้ ดังนั้น tour-api ต้องมี UI จัดการเรื่อง ระบบสมัคร และหน้าเว็บก็ต้องมีฟอร์มสมัคร และหน้า Dashoard สำหรับ ลูกค้า ระบบสมัครสมาชิก ต้องรองรับ otp เพื่อยืนยันตัวตนด้วย 

- รหัสผ่านต้องบังคับให้กำหนดแบบปลอดภัย
-สามารถ login ด้วย Email และ เบอร์มือถือได้
- สามารถ ส่งคำขอ Reset Password โดยส่งข้อมูลไปยัง Email ได้

มีการเก็บ
- ต้องการรับข่าวสารจาก TBS ผ่านทางอีเมลและ SMS
- ยอมรับ ข้อกำหนดและเงื่อนไขการใช้บริการ
- ยอมรับ นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy policy)

หมายเหตุเก็บ 
เก็บ  KeyAPI OTP ไว้ที่ .env แล้ว
คู่มือการใช้งาน OTP https://assets.thaibulksms.com/documents/developer-manual/nwc/API-v2-th.pdf


และในส่วนของ tour-api  ต้อง folder แยกสำหรับจัดการหน้าเว็บให้ชัดเจนจะได้ไม่รวมกันกับ Backend UI สร้างชื่อ Perfix  เป็น web นำหน้าก็ได้

1. ภาพรวมระบบ OTP สำหรับเว็บไซต์สมาชิก

OTP (One-Time Password) ใช้เพื่อยืนยันตัวตนของผู้ใช้ เช่น:

สมัครสมาชิกใหม่

เข้าสู่ระบบด้วยเบอร์โทร

รีเซ็ตรหัสผ่าน

แนวคิดหลัก

OTP มีอายุสั้น (เช่น 5 นาที)

ใช้ได้เพียงครั้งเดียว

ต้องตรวจสอบกับระบบผู้ให้บริการ (Verify)

2. ภาพรวมการเชื่อมต่อ ThaiBulkSMS API v2
Base URL
https://api-v2.thaibulksms.com
Authentication

ใช้ Basic Auth

Username = API Key

Password = API Secret

Headers (ทุก request)
Content-Type: application/json
Accept: application/json
3. Flow การทำงาน OTP (Request / Verify)
Flow โดยรวม

ผู้ใช้กรอกเบอร์โทร

Backend แปลงเบอร์ → MSISDN

Backend เรียก OTP Request API

ThaiBulkSMS ส่ง OTP ให้ผู้ใช้

API ส่ง message_id กลับมา

ผู้ใช้กรอก OTP

Backend เรียก OTP Verify API

ถ้าถูก → ยืนยันสมาชิกสำเร็จ

4. การป้องกันและแปลงเบอร์โทร (เลข 0 นำหน้า)
ปัญหาที่พบบ่อย

ผู้ใช้กรอก 066xxxxxxx

ระบบเติม 66 ซ้ำ → 66066xxxxxxx (ผิด)

กฎ MSISDN สำหรับประเทศไทย

รูปแบบที่ถูกต้อง: 66xxxxxxxxx

ตัด 0 ตัวหน้าออกเสมอ

ฟังก์ชันแปลงเบอร์ (PHP)
function normalizeThaiMsisdn(string $input): string
{
    $s = preg_replace('/[^\d]/', '', trim($input));


    if (str_starts_with($s, '0066')) {
        $s = '66' . substr($s, 4);
    }


    if (preg_match('/^0\d{9}$/', $s)) {
        return '66' . substr($s, 1);
    }


    if (preg_match('/^66\d{9}$/', $s)) {
        return $s;
    }


    throw new InvalidArgumentException('Invalid Thai phone number format');
}
5. ตัวอย่างการ Request OTP
Endpoint (ตัวอย่าง)
POST /otp/request

หมายเหตุ: ชื่อ endpoint จริงให้ยึดตามคู่มือในบัญชีของคุณ

Request Body
{
  "msisdn": "66812345678",
  "ttl": 300,
  "digits": 6,
  "message": "รหัส OTP ของคุณคือ {{otp}}"
}
Response (สำเร็จ)
{
  "remaining_credit": 8,
  "total_use_credit": 1,
  "credit_type": "standard",
  "phone_number_list": [
    {
      "number": "66812345678",
      "message_id": "pGwSP1FjDFNzUheO0DwvYB",
      "used_credit": 1
    }
  ],
  "bad_phone_number_list": []
}
6. โครงสร้างฐานข้อมูลที่แนะนำ
ตาราง: otp_requests
Field	Type	Description
id	bigint	PK
phone_msisdn	string	เบอร์โทรแบบ 66
message_id	string	อ้างอิง OTP
ttl	int	อายุ OTP (วินาที)
expires_at	datetime	เวลาหมดอายุ
attempts	int	จำนวนครั้งที่ลอง
verified_at	datetime	เวลาที่ยืนยัน
created_at	datetime	วันที่สร้าง
7. แนวทางความปลอดภัย (Security Best Practices)
7.1 จำกัดการขอ OTP

1 เบอร์: ไม่เกิน 3 ครั้ง / 10 นาที

1 IP: ไม่เกิน 20 ครั้ง / 10 นาที

7.2 จำกัดการกรอก OTP ผิด

ผิดเกิน 5 ครั้ง → ล็อกชั่วคราว

7.3 ไม่เก็บ OTP จริง

ใช้ Verify API ของผู้ให้บริการ

ห้าม log ค่า OTP

7.4 หมดอายุอัตโนมัติ

ใช้ ttl (เช่น 300 วินาที)

8. สรุปแนวทางใช้งาน

ใช้ ThaiBulkSMS API v2 (OTP) เท่านั้น

แปลงเบอร์โทรให้ถูกต้องก่อนเรียก API ทุกครั้ง

ใช้ Verify API เพื่อตรวจ OTP

จำกัด rate + attempts เพื่อความปลอดภัย

เอกสารนี้สามารถใช้เป็น Developer Guide หรือแนบใน Repository ได้ทันที