'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X, Minus as MinusIcon, Plus, Phone,
  Loader2, CheckCircle2, AlertCircle, ChevronDown,
} from 'lucide-react';
import { bookingApi, BookingResponse, TourDetail, TourDetailPeriod } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface BookingModalProps {
  tour: TourDetail;
  isOpen: boolean;
  onClose: () => void;
  selectedPeriod?: TourDetailPeriod | null;
}

export default function BookingModal({ tour, isOpen, onClose, selectedPeriod: initialPeriod }: BookingModalProps) {
  const { member, isAuthenticated } = useAuth();

  // Period selection
  const availablePeriods = tour.periods.filter(p => p.sale_status !== 'sold_out');
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(
    initialPeriod?.id || availablePeriods[0]?.id || null
  );
  const selectedPeriod = tour.periods.find(p => p.id === selectedPeriodId) || null;
  const offer = selectedPeriod?.offer || null;

  // Quantities - Passengers
  const [qtyAdult, setQtyAdult] = useState(1);
  const [qtyChildBed, setQtyChildBed] = useState(0);
  const [qtyChildNoBed, setQtyChildNoBed] = useState(0);
  const [qtyInfant, setQtyInfant] = useState(0);

  // Quantities - Room Types
  const [qtyTriple, setQtyTriple] = useState(0);
  const [qtyTwin, setQtyTwin] = useState(0);
  const [qtyDouble, setQtyDouble] = useState(0);
  const [qtySingle, setQtySingle] = useState(0);

  // Customer info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saleCode, setSaleCode] = useState('');
  const [salesUsers, setSalesUsers] = useState<{ id: number; name: string }[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [specialRequest, setSpecialRequest] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);

  // OTP flow (guest only)
  const [otpStep, setOtpStep] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [otpRequestId, setOtpRequestId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState('');

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Pre-fill for logged-in members
  useEffect(() => {
    if (isAuthenticated && member) {
      setFirstName(member.first_name || '');
      setLastName(member.last_name || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setOtpStep('verified');
    }
  }, [isAuthenticated, member]);

  // Fetch sales users
  useEffect(() => {
    setSalesLoading(true);
    bookingApi.getSales().then(res => {
      if (res.success && res.data) {
        setSalesUsers(res.data);
      }
    }).catch(() => {
      // Ignore error, optional feature
    }).finally(() => {
      setSalesLoading(false);
    });
  }, []);

  // Update period when initial changes
  useEffect(() => {
    if (initialPeriod) {
      setSelectedPeriodId(initialPeriod.id);
    }
  }, [initialPeriod]);

  // OTP countdown
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Total passengers (excluding infants for room calculation)
  const totalPassengers = qtyAdult + qtyChildBed + qtyChildNoBed;

  // Pricing calculations
  const calcPricing = useCallback(() => {
    if (!offer) return { 
      priceAdult: 0, priceSingle: 0, priceChildBed: 0, priceChildNoBed: 0, priceInfant: 0,
      priceTriple: 0, priceTwin: 0, priceDouble: 0,
      totalAdult: 0, totalChildBed: 0, totalChildNoBed: 0, totalInfant: 0,
      totalTriple: 0, totalTwin: 0, totalDouble: 0, totalSingle: 0,
      grandTotal: 0 
    };

    const priceAdult = offer.net_price_adult;
    const priceSingle = offer.net_price_single || 0;
    const priceChildBed = offer.price_child ? (offer.price_child - (offer.discount_child_bed || 0)) : 0;
    const priceChildNoBed = offer.price_child_nobed ? (offer.price_child_nobed - (offer.discount_child_nobed || 0)) : 0;
    const priceInfant = offer.price_infant || 0;

    // Room type prices (using adult price as base, single adds supplement)
    const priceTriple = priceAdult; // Triple room per person
    const priceTwin = priceAdult; // Twin room per person
    const priceDouble = priceAdult; // Double room per person

    const totalAdult = qtyAdult * priceAdult;
    const totalChildBed = qtyChildBed * priceChildBed;
    const totalChildNoBed = qtyChildNoBed * priceChildNoBed;
    const totalInfant = qtyInfant * priceInfant;

    // Room supplements
    const totalTriple = 0; // No supplement for triple
    const totalTwin = 0; // No supplement for twin
    const totalDouble = 0; // No supplement for double
    const totalSingle = qtySingle * priceSingle; // Single room supplement

    const grandTotal = totalAdult + totalChildBed + totalChildNoBed + totalInfant + totalSingle;

    return { 
      priceAdult, priceSingle, priceChildBed, priceChildNoBed, priceInfant,
      priceTriple, priceTwin, priceDouble,
      totalAdult, totalChildBed, totalChildNoBed, totalInfant,
      totalTriple, totalTwin, totalDouble, totalSingle,
      grandTotal 
    };
  }, [offer, qtyAdult, qtyChildBed, qtyChildNoBed, qtyInfant, qtySingle]);

  const pricing = calcPricing();

  // Handlers
  const handleRequestOtp = async () => {
    if (!phone || phone.length < 10) {
      setOtpError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }
    setOtpError('');
    setIsOtpLoading(true);
    try {
      const res = await bookingApi.requestOtp(phone);
      if (res.success) {
        setOtpRequestId(res.otp_request_id);
        setOtpStep('sent');
        setOtpCountdown(res.expires_in || 300);
        if (res.debug_otp) setOtpDebugCode(res.debug_otp);
      } else {
        setOtpError(res.message || 'ไม่สามารถส่ง OTP ได้');
      }
    } catch {
      setOtpError('เกิดข้อผิดพลาดในการส่ง OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpRequestId || !otpCode) return;
    setOtpError('');
    setIsOtpLoading(true);
    try {
      const res = await bookingApi.verifyOtp(otpRequestId, otpCode);
      if (res.success) {
        setOtpStep('verified');
      } else {
        setOtpError(res.message || 'OTP ไม่ถูกต้อง');
      }
    } catch {
      setOtpError('เกิดข้อผิดพลาดในการยืนยัน OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Calculate total rooms selected (for validation)
  // 1 person can use max 1 room (TWIN/DOUBLE fits 1-2, TRIPLE fits 1-3, SINGLE fits 1)
  const totalRooms = qtyTriple + qtyTwin + qtyDouble + qtySingle;
  const isRoomOverCount = totalRooms > totalPassengers;

  const handleSubmit = async () => {
    if (!selectedPeriodId) { setSubmitError('กรุณาเลือกรอบเดินทาง'); return; }
    if (!firstName.trim()) { setSubmitError('กรุณากรอกชื่อผู้ติดต่อ'); return; }
    if (!lastName.trim()) { setSubmitError('กรุณากรอกนามสกุล'); return; }
    if (!email.trim()) { setSubmitError('กรุณากรอกอีเมล'); return; }
    if (!phone.trim()) { setSubmitError('กรุณากรอกเบอร์โทรศัพท์'); return; }
    if (!isAuthenticated && otpStep !== 'verified') { setSubmitError('กรุณายืนยัน OTP ก่อน'); return; }
    if (!consentTerms) { setSubmitError('กรุณายอมรับเงื่อนไข'); return; }
    // Validate total rooms doesn't exceed passengers (1 person = max 1 room)
    if (isRoomOverCount) { setSubmitError(`จำนวนห้องพักเกินจำนวนผู้เดินทาง (${totalRooms} ห้อง / ${totalPassengers} คน)`); return; }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const res = await bookingApi.submit({
        tour_id: tour.id,
        period_id: selectedPeriodId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        qty_adult: qtyAdult,
        qty_adult_single: qtySingle, // Single room count
        qty_child_bed: qtyChildBed,
        qty_child_nobed: qtyChildNoBed,
        qty_infant: qtyInfant,
        qty_triple: qtyTriple,
        qty_twin: qtyTwin,
        qty_double: qtyDouble,
        sale_code: saleCode || undefined,
        special_request: specialRequest || undefined,
        consent_terms: true,
        otp_request_id: otpRequestId || undefined,
        otp_verified: otpStep === 'verified' || undefined,
      });

      if (res.success) {
        setBookingResult(res.booking);
      } else {
        setSubmitError(res.message || 'เกิดข้อผิดพลาดในการจอง');
      }
    } catch {
      setSubmitError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom dropdown open state
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  // Stepper component
  const Stepper = ({ value, onChange, min = 0, max = 99, disabled = false }: {
    value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean;
  }) => (
    <div className="flex items-center gap-1.5">
        
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
      >
        <MinusIcon className="w-3.5 h-3.5" />
      </button>
      <span className={`w-8 text-center font-bold text-base tabular-nums ${disabled ? 'text-gray-300' : ''}`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
      >

        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  // Person icon SVG (orange silhouette like reference image)
  const PersonIcon = () => (
    <svg viewBox="0 0 20 32" className="w-[14px] h-[22px] flex-shrink-0 fill-orange-500">
      <circle cx="10" cy="6.5" r="5.5" /> 
      <path d="M10 14C4 14 0 17.5 0 21.5V26c0 1.5 1 3 3 3h14c2 0 3-1.5 3-3v-4.5C20 17.5 16 14 10 14z" />
    </svg>
  );

  if (!isOpen) return null;
  const formatPeriodLabel = (p: TourDetailPeriod) => {
    const s = new Date(p.start_date);
    const e = new Date(p.end_date);
    return `${s.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`;
  };

  // Passenger types (ผู้เดินทาง)
  const passengerRows = [
    {
      label: 'ผู้ใหญ่',
      qty: qtyAdult,
      setQty: setQtyAdult,
      min: 1,
      unitPrice: pricing.priceAdult,
      totalPrice: pricing.totalAdult,
      hasPrice: !!offer && pricing.priceAdult > 0,
    },
    {
      label: 'เด็กมีเตียง',
      qty: qtyChildBed,
      setQty: setQtyChildBed,
      min: 0,
      unitPrice: pricing.priceChildBed,
      totalPrice: pricing.totalChildBed,
      hasPrice: !!offer && !!offer.price_child && offer.price_child > 0,
    },
    {
      label: 'เด็กไม่มีเตียง',
      qty: qtyChildNoBed,
      setQty: setQtyChildNoBed,
      min: 0,
      unitPrice: pricing.priceChildNoBed,
      totalPrice: pricing.totalChildNoBed,
      hasPrice: !!offer && !!offer.price_child_nobed && offer.price_child_nobed > 0,
    },
    {
      label: 'ทารก',
      qty: qtyInfant,
      setQty: setQtyInfant,
      min: 0,
      unitPrice: pricing.priceInfant,
      totalPrice: pricing.totalInfant,
      hasPrice: !!offer && !!offer.price_infant && offer.price_infant > 0,
    },
  ];

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
  const maxRooms = Math.max(10, totalPassengers); // Allow reasonable room selection
  const roomRows = [
    {
      label: 'พัก 3 ท่าน (TRIPLE)',
      qty: qtyTriple,
      setQty: (v: number) => handleRoomChange('triple', v),
      min: 0,
      max: maxRooms,
      unitPrice: 0, // No additional charge - included in tour price
      totalPrice: 0,
      hasPrice: true,
      capacityPerRoom: 3,
      iconCount: 3,
    },
    {
      label: 'พักคู่ (TWIN)',
      qty: qtyTwin,
      setQty: (v: number) => handleRoomChange('twin', v),
      min: 0,
      max: maxRooms,
      unitPrice: 0, // No additional charge - included in tour price
      totalPrice: 0,
      hasPrice: true,
      capacityPerRoom: 2,
      iconCount: 2,
    },
    {
      label: 'พักคู่ (DOUBLE)',
      qty: qtyDouble,
      setQty: (v: number) => handleRoomChange('double', v),
      min: 0,
      max: maxRooms,
      unitPrice: 0, // No additional charge - included in tour price
      totalPrice: 0,
      hasPrice: true,
      capacityPerRoom: 2,
      iconCount: 1,
    },
    {
      label: 'พักเดี่ยว (SINGLE)',
      qty: qtySingle,
      setQty: (v: number) => handleRoomChange('single', v),
      min: 0,
      max: maxRooms,
      unitPrice: pricing.priceSingle,
      totalPrice: pricing.totalSingle,
      hasPrice: true, // Always show - additional purchase for single room supplement
      capacityPerRoom: 1,
      iconCount: 1,
    },
  ];

  return (
    <div className="fixed inset-0 z-500 flex items-start justify-center overflow-y-auto pt-28 sm:pt-32 pb-4 sm:pb-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      {/* Modal container */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* ===== Header (orange gradient) ===== */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 rounded-t-2xl px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <h2 className="text-white font-bold text-sm sm:text-base truncate flex-1 min-w-0">
            {tour.title}
            {tour.duration_days > 0 && ` ${tour.duration_days}D ${tour.duration_nights}N`}
            {tour.transports?.[0]?.airline?.name && ` โดย${tour.transports[0].airline.name}`}
          </h2>
          {selectedPeriod && (
            <div className="hidden sm:flex items-center bg-yellow-300/80 text-orange-700 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap">
              ที่นั่ง {selectedPeriod.capacity} &nbsp;|&nbsp; จอง {selectedPeriod.booked} &nbsp;|&nbsp; คงเหลือ {selectedPeriod.available}
            </div>
          )}
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer flex-shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile seat badge */}
        {selectedPeriod && (
          <div className="sm:hidden flex justify-center py-2 bg-gray-50">
            <div className="bg-yellow-300 text-orange-700 font-bold text-xs px-4 py-1.5 rounded-full shadow-sm">
              ที่นั่ง {selectedPeriod.capacity} | จอง {selectedPeriod.booked} | คงเหลือ {selectedPeriod.available}
            </div>
          </div>
        )}

        {/* Booking Success overlay */}
        {bookingResult && (
          <div className="absolute inset-0 z-10 bg-white rounded-2xl flex flex-col">
            <div className="bg-green-500 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold">จองทัวร์สำเร็จ!</h3>
              </div>
              <button onClick={() => { setBookingResult(null); onClose(); }} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">รหัสการจอง</h4>
              <div className="text-2xl font-mono font-bold text-green-600 mb-3">{bookingResult.booking_code}</div>
              <p className="text-gray-600 text-sm mb-1">{bookingResult.tour_title}</p>
              <p className="text-xs text-gray-500 mb-3">{bookingResult.period}</p>
              <div className="bg-gray-50 rounded-xl px-5 py-2 inline-flex items-center gap-2">
                <span className="text-gray-500 text-sm">ยอดรวม</span>
                <span className="text-lg font-bold text-orange-500">฿{Number(bookingResult.total_amount).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">สถานะ: <span className="font-semibold text-orange-500">{bookingResult.status_label}</span></p>
              <p className="text-xs text-gray-400 mt-2">กรุณารอเจ้าหน้าที่ติดต่อกลับเพื่อยืนยันการจอง</p>
              <button
                onClick={() => { setBookingResult(null); onClose(); }}
                className="mt-5 w-full max-w-xs py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {/* ===== Period selector ===== */}
        <div className="px-5 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
          <label className="text-xs text-gray-500 font-medium mb-1 block">เลือกรอบเดินทาง</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPeriodDropdownOpen(prev => !prev)}
              className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none cursor-pointer text-left"
            >
              {selectedPeriod ? (
                <span>{formatPeriodLabel(selectedPeriod)} — ว่าง {selectedPeriod.available} ที่ {selectedPeriod.offer ? `(฿${selectedPeriod.offer.net_price_adult.toLocaleString()}/ท่าน)` : ''}</span>
              ) : (
                <span className="text-gray-400">เลือกรอบเดินทาง</span>
              )}
            </button>
            <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${periodDropdownOpen ? 'rotate-180' : ''}`} />

            {/* Custom dropdown list */}
            {periodDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setPeriodDropdownOpen(false)} />
                <ul className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {availablePeriods.map(p => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedPeriodId(p.id); setPeriodDropdownOpen(false); }}
                        className={`w-full px-3 py-2.5 text-left text-sm hover:bg-orange-50 transition cursor-pointer ${p.id === selectedPeriodId ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}
                      >
                        {formatPeriodLabel(p)} — ว่าง {p.available} ที่ {p.offer ? `(฿${p.offer.net_price_adult.toLocaleString()}/ท่าน)` : ''}
                      </button>
                    </li>
                  ))}
                  {availablePeriods.length === 0 && (
                    <li className="px-3 py-2.5 text-sm text-gray-400 text-center">ไม่มีรอบเดินทางที่ว่าง</li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* ===== Row 1: ผู้เดินทาง + ห้องพัก ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-gray-200">

          {/* ========== LEFT: ผู้เดินทาง ========== */}
          <div className="px-5 sm:px-6 py-5 lg:border-r border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ผู้เดินทาง</h3>

            {/* Table header (orange gradient) */}
            <div className="grid grid-cols-[1fr_100px] items-center bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-xl px-3 py-2">
              <span></span>
              <span className="text-white font-bold text-xs text-center">จำนวน</span>
            </div>

            {/* Passenger rows */}
            <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
              {passengerRows.map((row, idx) => (
                <div key={idx} className={`grid grid-cols-[1fr_100px] items-center px-3 py-2 ${!row.hasPrice ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2">
                    <PersonIcon />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{row.label}</span>
                      {row.hasPrice && row.unitPrice > 0 && (
                        <span className="text-xs text-orange-500">{row.unitPrice.toLocaleString()} บาท</span>
                      )}
                      {!row.hasPrice && (
                        <span className="text-xs text-orange-500">ติดต่อฝ่ายขาย</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Stepper value={row.qty} onChange={row.setQty} min={row.min} disabled={!row.hasPrice} />
                  </div>
                </div>
              ))}
            </div>

            {/* Grand total */}
            <div className="mt-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl px-5 py-3 flex items-center justify-end">
              <span className="text-white font-bold text-lg">
                รวม : {pricing.grandTotal > 0 ? `${pricing.grandTotal.toLocaleString()} บาท` : '-'}
              </span>
            </div>
          </div>

          {/* ========== RIGHT: ห้องพัก ========== */}
          <div className="px-5 sm:px-6 py-5 border-t lg:border-t-0">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ห้องพัก</h3>

            {/* Room header (orange gradient) */}
            <div className="grid grid-cols-[1fr_100px] items-center bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-xl px-3 py-2">
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
                            <svg key={i} viewBox="0 0 24 24" className="w-[16px] h-[16px] flex-shrink-0 fill-orange-500">
                              <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4zm2 8h-8V9h6c1.1 0 2 .9 2 2v4z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      {row.unitPrice > 0 ? (
                        <span className="text-xs text-orange-500">+{row.unitPrice.toLocaleString()} บาท/ห้อง</span>
                      ) : (
                        <span className="text-xs text-gray-400">ไม่มีค่าใช้จ่าย</span>
                      )}
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
              {pricing.totalSingle > 0 && (
                <p className="text-orange-600 font-medium">ค่าพักเดี่ยว: +{pricing.totalSingle.toLocaleString()} บาท</p>
              )}
            </div>
          </div>
        </div>

        {/* ===== Row 2: เงื่อนไข + ข้อมูลผู้เดินทาง ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">

          {/* ========== LEFT: เงื่อนไข ========== */}
          <div className="px-5 sm:px-6 py-5 lg:border-r border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">เงื่อนไขการจอง</h3>
            <div className="text-[14px] text-gray-500 leading-[1.7] space-y-0">
              <p>• การจองทัวร์นี้ยังไม่ใช่การคอนเฟิร์มที่นั่งทันที กรุณารอการตอบกลับจากเจ้าหน้าที่เท่านั้น</p>
              <p>• หากลูกค้าจองทัวร์ในช่วงวันจันทร์-ศุกร์ เวลา 09.00 น-18.00 น. หากระยะเวลาจองผ่านมากกว่า 5 นาทีและยังไม่มีเจ้าหน้าที่ติดต่อกลับ รบกวนลูกค้าแจ้งมาที่ไลน์ @nexttripholiday หรือโทร 02-136-9144 พร้อมแจ้งรหัสการจอง</p>
              <p>• ลูกค้าสามารถเปลี่ยนแปลงวันที่เดินทางได้ กรุณาติดต่อพนักงานขายที่ทำการจอง</p>
              <p>• บริษัทฯ ขอสงวนสิทธิ์ในการยกเลิกการจอง ในกรณีที่นั่งเต็ม หรือ ทัวร์ไม่คอนเฟิร์มออกเดินทาง</p>
              <p>• ระยะเวลาในการใช้ส่วนลดเป็นไปตามที่บริษัทฯ กำหนด</p>
              <p>• ส่วนลดพิเศษจะใช้ได้ต่อเมื่อได้รับการยืนยันจากเจ้าหน้าที่เท่านั้น</p>
              <p>• การจองจะเสร็จสมบูรณ์เมื่อลูกค้าได้รับการยืนยันที่นั่งเป็นเอกสารและลูกค้าได้ชำระยอดเงิน เท่านั้น</p>
              <p>• บริษัทฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดและเงื่อนไขต่าง ๆ ของส่วนลดพิเศษโดยมิต้องแจ้งให้ทราบล่วงหน้า</p>
            </div>
          </div>

          {/* ========== RIGHT (Row 2): ข้อมูลผู้เดินทาง ========== */}
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
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">นามสกุล<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="นามสกุล"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* อีเมล / เบอร์โทร + OTP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700">อีเมล<span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="อีเมล"
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    เบอร์โทรศัพท์<span className="text-red-500">*</span>
                    {!isAuthenticated && otpStep !== 'verified' && <span className="text-gray-400 font-normal ml-1">ยืนยัน OTP</span>}
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (otpStep !== 'idle') { setOtpStep('idle'); setOtpCode(''); }
                      }}
                      placeholder="เบอร์โทรศัพท์"
                      disabled={isAuthenticated}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition disabled:bg-gray-50 placeholder:text-gray-400"
                    />
                    {!isAuthenticated && otpStep === 'idle' && (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isOtpLoading || !phone || phone.length < 10}
                        className="px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap cursor-pointer"
                      >
                        {isOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ส่ง OTP'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP input (guest, when sent) */}
              {!isAuthenticated && otpStep === 'sent' && (
                <div className="p-3 bg-orange-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700">กรอกรหัส OTP ที่ส่งไปยังเบอร์ {phone}</span>
                    {otpCountdown > 0 && (
                      <span className="text-xs text-orange-400 ml-auto">
                        {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  {otpDebugCode && (
                    <div className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> DEBUG OTP: <span className="font-mono font-bold">{otpDebugCode}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="กรอก OTP 6 หลัก"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center tracking-[0.5em] font-mono focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isOtpLoading || otpCode.length !== 6}
                      className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
                    >
                      {isOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ยืนยัน'}
                    </button>
                  </div>
                  {otpCountdown <= 0 && (
                    <button type="button" onClick={handleRequestOtp} className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
                      ส่ง OTP อีกครั้ง
                    </button>
                  )}
                </div>
              )}

              {/* OTP verified badge */}
              {!isAuthenticated && otpStep === 'verified' && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยัน OTP สำเร็จ</span>
                </div>
              )}

              {otpError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />{otpError}
                </div>
              )}

              {/* เลือก Sale */}
              {(salesLoading || salesUsers.length > 0) && (
                <div>
                  <label className="text-sm font-bold text-gray-700">เลือก Sale</label>
                  <select
                    value={saleCode}
                    onChange={(e) => setSaleCode(e.target.value)}
                    disabled={salesLoading}
                    className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition bg-white cursor-pointer disabled:bg-gray-50"
                  >
                    {salesLoading ? (
                      <option value="">กำลังโหลด...</option>
                    ) : (
                      <>
                        <option value="">-- กรุณาเลือกหากท่านติดต่อผู้ขายไว้ --</option>
                        {salesUsers.map(sale => (
                          <option key={sale.id} value={sale.name}>{sale.name}</option>
                        ))}
                      </>
                    )}
                  </select>
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
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition resize-none placeholder:text-gray-400"
                />
              </div>

              {/* Consent checkbox + Submit button */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentTerms}
                    onChange={(e) => setConsentTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer accent-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">ฉันอ่านเงื่อนไขแล้ว</span>
                </label>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !consentTerms || (!isAuthenticated && otpStep !== 'verified')}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> กำลังส่ง...</>
                  ) : (
                    'ส่งใบจองทัวร์'
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
