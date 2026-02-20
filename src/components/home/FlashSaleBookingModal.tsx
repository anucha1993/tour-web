'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X, Minus as MinusIcon, Plus,
  Loader2, CheckCircle2, AlertCircle, Zap, Calendar,
} from 'lucide-react';
import { bookingApi, FlashSalePublicItem, BookingResponse } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface FlashSaleBookingModalProps {
  item: FlashSalePublicItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function FlashSaleBookingModal({ item, isOpen, onClose }: FlashSaleBookingModalProps) {
  const { member, isAuthenticated } = useAuth();

  // Quantities
  const [qtyAdult, setQtyAdult] = useState(1);
  const [qtyAdultSingle, setQtyAdultSingle] = useState(0);
  const [qtyChildBed, setQtyChildBed] = useState(0);
  const [qtyChildNoBed, setQtyChildNoBed] = useState(0);

  // Customer info (pre-filled from member)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  // Pre-fill for logged-in members
  useEffect(() => {
    if (isAuthenticated && member) {
      setFirstName(member.first_name || '');
      setLastName(member.last_name || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
    }
  }, [isAuthenticated, member]);

  // Pricing
  const flashPrice = Number(item.flash_price);
  const originalPrice = Number(item.original_price_snapshot || item.original_price || 0);

  const calcPricing = useCallback(() => {
    const priceAdult = flashPrice;
    const priceSingle = 0; // Flash sale simplifies to flash_price only
    const priceChildBed = 0;
    const priceChildNoBed = 0;

    const adultNonSingle = Math.max(qtyAdult - qtyAdultSingle, 0);
    const totalAdult = adultNonSingle * priceAdult;
    const totalSingle = qtyAdultSingle * (priceAdult + priceSingle);
    const totalChildBed = qtyChildBed * priceChildBed;
    const totalChildNoBed = qtyChildNoBed * priceChildNoBed;
    const grandTotal = totalAdult + totalSingle + totalChildBed + totalChildNoBed;

    return { priceAdult, priceSingle, priceChildBed, priceChildNoBed, totalAdult, totalSingle, totalChildBed, totalChildNoBed, grandTotal };
  }, [flashPrice, qtyAdult, qtyAdultSingle, qtyChildBed, qtyChildNoBed]);

  const pricing = calcPricing();

  const handleSubmit = async () => {
    if (!firstName.trim()) { setSubmitError('กรุณากรอกชื่อผู้ติดต่อ'); return; }
    if (!lastName.trim()) { setSubmitError('กรุณากรอกนามสกุล'); return; }
    if (!email.trim()) { setSubmitError('กรุณากรอกอีเมล'); return; }
    if (!phone.trim()) { setSubmitError('กรุณากรอกเบอร์โทรศัพท์'); return; }
    if (!consentTerms) { setSubmitError('กรุณายอมรับเงื่อนไข'); return; }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const res = await bookingApi.submitFlashSale({
        flash_sale_item_id: item.flash_sale_item_id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        qty_adult: qtyAdult,
        qty_adult_single: qtyAdultSingle,
        qty_child_bed: qtyChildBed,
        qty_child_nobed: qtyChildNoBed,
        special_request: specialRequest || undefined,
        consent_terms: true,
      });

      if (res.success) {
        setBookingResult(res.booking);
      } else {
        setSubmitError(res.message || 'เกิดข้อผิดพลาดในการจอง');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      // Try to extract API error message
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setSubmitError(apiErr.response?.data?.message || errorMsg);
      } else {
        setSubmitError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper component
  const Stepper = ({ value, onChange, min = 0, max = 99, disabled = false }: {
    value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean;
  }) => (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
      >
        <MinusIcon className="w-3.5 h-3.5" />
      </button>
      <span className={`w-8 text-center font-bold text-base tabular-nums ${disabled ? 'text-gray-300' : ''}`}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  // Person icon
  const PersonIcon = () => (
    <svg viewBox="0 0 20 32" className="w-[14px] h-[22px] flex-shrink-0 fill-red-500">
      <circle cx="10" cy="6.5" r="5.5" />
      <path d="M10 14C4 14 0 17.5 0 21.5V26c0 1.5 1 3 3 3h14c2 0 3-1.5 3-3v-4.5C20 17.5 16 14 10 14z" />
    </svg>
  );

  if (!isOpen) return null;

  const formatDateThai = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

  const stockRemaining = item.quantity_limit ? Math.max(0, item.quantity_limit - item.quantity_sold) : null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto pt-28 sm:pt-32 pb-4 sm:pb-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[900px] mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* ── Success overlay ── */}
        {bookingResult && (
          <div className="absolute inset-0 z-10 bg-white rounded-2xl flex flex-col">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-bold text-lg">จอง Flash Sale สำเร็จ!</h3>
              </div>
              <button onClick={() => { setBookingResult(null); onClose(); }} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">รหัสการจอง</h4>
              <div className="text-3xl font-mono font-bold text-green-600 mb-4">{bookingResult.booking_code}</div>
              <p className="text-gray-600 mb-1">{bookingResult.tour_title}</p>
              <p className="text-sm text-gray-500 mb-4">{bookingResult.period}</p>
              <div className="bg-gray-50 rounded-xl px-6 py-3 inline-flex items-center gap-3">
                <span className="text-gray-500">ยอดรวม</span>
                <span className="text-xl font-bold text-red-500">฿{Number(bookingResult.total_amount).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">สถานะ: <span className="font-semibold text-orange-500">{bookingResult.status_label}</span></p>
              <p className="text-xs text-gray-400 mt-2">กรุณารอเจ้าหน้าที่ติดต่อกลับเพื่อยืนยันการจอง</p>
              <button
                onClick={() => { setBookingResult(null); onClose(); }}
                className="mt-6 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {/* ── Header (red gradient for flash sale) ── */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 rounded-t-2xl px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 flex-shrink-0" />
            <h2 className="text-white font-bold text-sm sm:text-base truncate">
              จอง Flash Sale
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer flex-shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Tour info bar ── */}
        <div className="px-5 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="font-mono">{item.tour_code}</span>
                <span>•</span>
                <Calendar className="w-3 h-3" />
                <span>{formatDateThai(item.period_start_date)} - {formatDateThai(item.period_end_date)}</span>
                {item.days > 0 && <span>• {item.days}D{item.nights}N</span>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {originalPrice > flashPrice && (
                  <span className="text-xs text-gray-400 line-through">฿{originalPrice.toLocaleString()}</span>
                )}
                <span className="text-lg font-bold text-red-500">฿{flashPrice.toLocaleString()}</span>
              </div>
              {Number(item.discount_percent) > 0 && (
                <span className="inline-flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  <Zap className="w-2.5 h-2.5 fill-white" />-{item.discount_percent}%
                </span>
              )}
            </div>
          </div>
          {stockRemaining !== null && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-gray-500">เหลือ</span>
              <span className="font-bold text-red-500">{stockRemaining}</span>
              <span className="text-gray-500">ที่</span>
            </div>
          )}
        </div>

        {/* ── Two-column content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">

          {/* LEFT: Quantity + Pricing */}
          <div className="px-5 sm:px-6 py-5 lg:border-r border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">รายละเอียดการจอง</h3>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_110px_80px_80px] items-center bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl px-4 py-2">
              <span></span>
              <span className="text-white font-bold text-sm text-center">จำนวน</span>
              <span className="text-white font-bold text-sm text-center">ราคา</span>
              <span className="text-white font-bold text-sm text-center">รวม</span>
            </div>

            {/* Passenger rows */}
            <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
              {/* Adult */}
              <div className="grid grid-cols-[1fr_110px_80px_80px] items-center px-4 py-3">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <span className="text-sm font-medium text-gray-700">ผู้ใหญ่</span>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyAdult} onChange={setQtyAdult} min={1} />
                </div>
                <div className="text-center text-sm text-gray-600 tabular-nums">
                  {pricing.priceAdult.toLocaleString()}
                </div>
                <div className="text-center text-sm font-semibold text-gray-800 tabular-nums">
                  {(Math.max(qtyAdult - qtyAdultSingle, 0) * pricing.priceAdult).toLocaleString()}
                </div>
              </div>
              {/* Adult Single */}
              <div className="grid grid-cols-[1fr_110px_80px_80px] items-center px-4 py-3 opacity-60">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <span className="text-sm font-medium text-gray-700">ผู้ใหญ่ (พักเดี่ยว)</span>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyAdultSingle} onChange={(v) => setQtyAdultSingle(Math.min(v, qtyAdult))} min={0} disabled />
                </div>
                <div className="text-center text-sm text-gray-600">-</div>
                <div className="text-center text-sm text-orange-500 text-[11px]">ติดต่อฝ่ายขาย</div>
              </div>
              {/* Child bed */}
              <div className="grid grid-cols-[1fr_110px_80px_80px] items-center px-4 py-3 opacity-60">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <span className="text-sm font-medium text-gray-700">เด็ก (มีเตียง)</span>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyChildBed} onChange={setQtyChildBed} min={0} disabled />
                </div>
                <div className="text-center text-sm text-gray-600">-</div>
                <div className="text-center text-sm text-orange-500 text-[11px]">ติดต่อฝ่ายขาย</div>
              </div>
              {/* Child no bed */}
              <div className="grid grid-cols-[1fr_110px_80px_80px] items-center px-4 py-3 opacity-60">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <span className="text-sm font-medium text-gray-700">เด็ก (ไม่มีเตียง)</span>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyChildNoBed} onChange={setQtyChildNoBed} min={0} disabled />
                </div>
                <div className="text-center text-sm text-gray-600">-</div>
                <div className="text-center text-sm text-orange-500 text-[11px]">ติดต่อฝ่ายขาย</div>
              </div>
            </div>

            {/* Grand total */}
            <div className="mt-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl px-5 py-3 flex items-center justify-end">
              <span className="text-white font-bold text-lg">
                รวม : {pricing.grandTotal > 0 ? `${pricing.grandTotal.toLocaleString()} บาท` : '-'}
              </span>
            </div>

            {/* Conditions */}
            <div className="mt-4 text-[11px] text-gray-500 leading-[1.8] space-y-0">
              <p>• การจอง Flash Sale ยังไม่ใช่การคอนเฟิร์มที่นั่งทันที รอเจ้าหน้าที่ตอบกลับ</p>
              <p>• ราคา Flash Sale เป็นราคาพิเศษ ไม่สามารถใช้ร่วมกับโปรโมชั่นอื่นได้</p>
              <p>• บริษัทฯ ขอสงวนสิทธิ์ในการยกเลิก หากที่นั่งเต็มหรือทัวร์ไม่คอนเฟิร์ม</p>
              <p>• การจองจะเสร็จสมบูรณ์เมื่อได้รับการยืนยันและชำระเงินเท่านั้น</p>
            </div>

            {/* Consent + Submit button */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-400 cursor-pointer accent-red-500"
                />
                <span className="text-sm text-gray-700 font-medium">ฉันอ่านเงื่อนไขแล้ว</span>
              </label>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !consentTerms}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg cursor-pointer flex items-center gap-2 text-sm whitespace-nowrap"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> กำลังจอง...</>
                ) : (
                  <><Zap className="w-4 h-4 fill-white" /> จอง Flash Sale</>
                )}
              </button>
            </div>
            {submitError && (
              <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{submitError}
              </div>
            )}
          </div>

          {/* RIGHT: Customer info */}
          <div className="px-5 sm:px-6 py-5 border-t lg:border-t-0 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลผู้เดินทาง</h3>

            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700">ชื่อผู้ติดต่อ<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="ชื่อผู้ติดต่อ"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">นามสกุล<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="นามสกุล"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700">อีเมล<span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="อีเมล"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">เบอร์โทรศัพท์<span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เบอร์โทรศัพท์"
                    disabled={isAuthenticated}
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition disabled:bg-gray-50 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Logged-in badge */}
              {isAuthenticated && member && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>เข้าสู่ระบบแล้ว: {member.full_name}</span>
                </div>
              )}

              {/* Special request */}
              <div>
                <label className="text-sm font-bold text-gray-700">ความต้องการพิเศษ</label>
                <textarea
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="ความต้องการพิเศษ"
                  rows={4}
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition resize-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
