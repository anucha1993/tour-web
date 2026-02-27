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

  // Quantities - Passengers
  const [qtyAdult, setQtyAdult] = useState(1);
  const [qtyAdultSingle, setQtyAdultSingle] = useState(0);
  const [qtyChildBed, setQtyChildBed] = useState(0);
  const [qtyChildNoBed, setQtyChildNoBed] = useState(0);
  const [qtyInfant, setQtyInfant] = useState(0);

  // Quantities - Room Types
  const [qtyTriple, setQtyTriple] = useState(0);
  const [qtyTwin, setQtyTwin] = useState(0);
  const [qtyDouble, setQtyDouble] = useState(0);
  const [qtySingle, setQtySingle] = useState(0);

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

  // Total passengers and room count (for validation)
  // 1 person can use max 1 room (TWIN/DOUBLE fits 1-2, TRIPLE fits 1-3, SINGLE fits 1)
  const totalPassengers = qtyAdult + qtyChildBed + qtyChildNoBed;
  const totalRooms = qtyTriple + qtyTwin + qtyDouble + qtySingle;
  const isRoomOverCount = totalRooms > totalPassengers;

  const handleSubmit = async () => {
    if (!firstName.trim()) { setSubmitError('กรุณากรอกชื่อผู้ติดต่อ'); return; }
    if (!lastName.trim()) { setSubmitError('กรุณากรอกนามสกุล'); return; }
    if (!email.trim()) { setSubmitError('กรุณากรอกอีเมล'); return; }
    if (!phone.trim()) { setSubmitError('กรุณากรอกเบอร์โทรศัพท์'); return; }
    if (!consentTerms) { setSubmitError('กรุณายอมรับเงื่อนไข'); return; }
    // Validate total rooms doesn't exceed passengers (1 person = max 1 room)
    if (isRoomOverCount) { setSubmitError(`จำนวนห้องพักเกินจำนวนผู้เดินทาง (${totalRooms} ห้อง / ${totalPassengers} คน)`); return; }

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
        qty_infant: qtyInfant,
        qty_triple: qtyTriple,
        qty_twin: qtyTwin,
        qty_double: qtyDouble,
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

  // Room change handler - no strict capacity validation
  // DOUBLE/TWIN are included in tour price, SINGLE is additional purchase
  const handleRoomChange = (roomType: 'triple' | 'twin' | 'double' | 'single', newValue: number) => {
    switch (roomType) {
      case 'triple': setQtyTriple(newValue); break;
      case 'twin': setQtyTwin(newValue); break;
      case 'double': setQtyDouble(newValue); break;
      case 'single': setQtySingle(newValue); break;
    }
  };

  // Room types (ห้องพัก)
  // DOUBLE/TWIN/TRIPLE included in tour price, SINGLE is additional purchase
  const maxRooms = Math.max(10, totalPassengers);
  const roomRows = [
    {
      label: 'พัก 3 ท่าน (TRIPLE)',
      qty: qtyTriple,
      setQty: (v: number) => handleRoomChange('triple', v),
      min: 0,
      max: maxRooms,
      iconCount: 3,
    },
    {
      label: 'พักคู่ (TWIN)',
      qty: qtyTwin,
      setQty: (v: number) => handleRoomChange('twin', v),
      min: 0,
      max: maxRooms,
      iconCount: 2,
    },
    {
      label: 'พักคู่ (DOUBLE)',
      qty: qtyDouble,
      setQty: (v: number) => handleRoomChange('double', v),
      min: 0,
      max: maxRooms,
      iconCount: 1,
    },
    {
      label: 'พักเดี่ยว (SINGLE)',
      qty: qtySingle,
      setQty: (v: number) => handleRoomChange('single', v),
      min: 0,
      max: maxRooms,
      iconCount: 1,
    },
  ];

  // Person icon
  const PersonIcon = () => (
    <svg viewBox="0 0 20 32" className="w-[14px] h-[22px] flex-shrink-0 fill-red-500">
      <circle cx="10" cy="6.5" r="5.5" />
      <path d="M10 14C4 14 0 17.5 0 21.5V26c0 1.5 1 3 3 3h14c2 0 3-1.5 3-3v-4.5C20 17.5 16 14 10 14z" />
    </svg>
  );

  // Bed icon
  const BedIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] flex-shrink-0 fill-red-500">
      <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4zm2 8h-8V9h6c1.1 0 2 .9 2 2v4z"/>
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
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>

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

        {/* ===== Row 1: ผู้เดินทาง + ห้องพัก ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-gray-200">

          {/* ========== LEFT: ผู้เดินทาง ========== */}
          <div className="px-5 sm:px-6 py-5 lg:border-r border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ผู้เดินทาง</h3>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px] items-center bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl px-3 py-2">
              <span></span>
              <span className="text-white font-bold text-xs text-center">จำนวน</span>
            </div>

            {/* Passenger rows */}
            <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
              {/* Adult */}
              <div className="grid grid-cols-[1fr_100px] items-center px-3 py-2">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">ผู้ใหญ่</span>
                    <span className="text-xs text-red-500">{pricing.priceAdult.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyAdult} onChange={setQtyAdult} min={1} />
                </div>
              </div>
              {/* Adult Single - disabled */}
              <div className="grid grid-cols-[1fr_100px] items-center px-3 py-2 opacity-60">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">ผู้ใหญ่ (พักเดี่ยว)</span>
                    <span className="text-xs text-red-500">ติดต่อฝ่ายขาย</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyAdultSingle} onChange={(v) => setQtyAdultSingle(Math.min(v, qtyAdult))} min={0} disabled />
                </div>
              </div>
              {/* Child bed - disabled */}
              <div className="grid grid-cols-[1fr_100px] items-center px-3 py-2 opacity-60">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">เด็กมีเตียง</span>
                    <span className="text-xs text-red-500">ติดต่อฝ่ายขาย</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyChildBed} onChange={setQtyChildBed} min={0} disabled />
                </div>
              </div>
              {/* Child no bed - disabled */}
              <div className="grid grid-cols-[1fr_100px] items-center px-3 py-2 opacity-60">
                <div className="flex items-center gap-2">
                  <PersonIcon />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">เด็กไม่มีเตียง</span>
                    <span className="text-xs text-red-500">ติดต่อฝ่ายขาย</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Stepper value={qtyChildNoBed} onChange={setQtyChildNoBed} min={0} disabled />
                </div>
              </div>
            </div>

            {/* Grand total */}
            <div className="mt-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl px-5 py-3 flex items-center justify-end">
              <span className="text-white font-bold text-lg">
                รวม : {pricing.grandTotal > 0 ? `${pricing.grandTotal.toLocaleString()} บาท` : '-'}
              </span>
            </div>
          </div>

          {/* ========== RIGHT: ห้องพัก ========== */}
          <div className="px-5 sm:px-6 py-5 border-t lg:border-t-0">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ห้องพัก</h3>

            {/* Room header */}
            <div className="grid grid-cols-[1fr_100px] items-center bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl px-3 py-2">
              <span></span>
              <span className="text-white font-bold text-xs text-center">จำนวน</span>
            </div>

            {/* Room rows */}
            <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
              {roomRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_100px] items-center px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-700 w-[130px]">{row.label}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: row.iconCount }).map((_, i) => (
                            <BedIcon key={i} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">ไม่มีค่าใช้จ่าย</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Stepper value={row.qty} onChange={row.setQty} min={row.min} max={row.max} />
                  </div>
                </div>
              ))}
            </div>

            {/* Room allocation info */}
            <div className="mt-3 text-xs text-gray-500">
              <p>เลือกห้องพัก: {totalRooms} ห้อง / ผู้เดินทาง {totalPassengers} คน</p>
              {isRoomOverCount && (
                <p className="text-red-500 font-medium">⚠️ ห้องพักเกินจำนวนผู้เดินทาง {totalRooms - totalPassengers} ห้อง</p>
              )}
            </div>
          </div>
        </div>

        {/* ===== Row 2: เงื่อนไข + ข้อมูลผู้เดินทาง ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">

          {/* ========== LEFT: เงื่อนไข ========== */}
          <div className="px-5 sm:px-6 py-5 lg:border-r border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">เงื่อนไขการจอง</h3>
            <div className="text-[12px] text-gray-500 leading-[1.7] space-y-0">
              <p>• การจอง Flash Sale ยังไม่ใช่การคอนเฟิร์มที่นั่งทันที รอเจ้าหน้าที่ตอบกลับ</p>
              <p>• ราคา Flash Sale เป็นราคาพิเศษ ไม่สามารถใช้ร่วมกับโปรโมชั่นอื่นได้</p>
              <p>• บริษัทฯ ขอสงวนสิทธิ์ในการยกเลิก หากที่นั่งเต็มหรือทัวร์ไม่คอนเฟิร์ม</p>
              <p>• การจองจะเสร็จสมบูรณ์เมื่อได้รับการยืนยันและชำระเงินเท่านั้น</p>
            </div>
          </div>

          {/* ========== RIGHT: ข้อมูลผู้เดินทาง ========== */}
          <div className="px-5 sm:px-6 py-5 border-t lg:border-t-0">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ข้อมูลผู้เดินทาง</h3>

            <div className="space-y-3">
              {/* ชื่อ / นามสกุล */}
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

              {/* อีเมล / เบอร์โทร */}
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

              {/* ความต้องการพิเศษ */}
              <div>
                <label className="text-sm font-bold text-gray-700">ความต้องการพิเศษ</label>
                <textarea
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="ความต้องการพิเศษ"
                  rows={3}
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition resize-none placeholder:text-gray-400"
                />
              </div>

              {/* Consent checkbox + Submit button */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
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
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> กำลังจอง...</>
                ) : (
                  <><Zap className="w-4 h-4 fill-white" /> จอง Flash Sale</>
                )}
                </button>
                {submitError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{submitError}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
