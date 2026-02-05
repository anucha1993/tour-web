'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Phone, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, authApi } from '@/lib/api';

// Password requirement check component (outside main component)
const PasswordCheck = ({ valid, text }: { valid: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-sm ${valid ? 'text-green-600' : 'text-gray-400'}`}>
    {valid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    {text}
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const { setMember, isAuthenticated } = useAuth();
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // Consent
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  
  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpRequestId, setOtpRequestId] = useState<number | null>(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/member');
    }
  }, [isAuthenticated, router]);

  // OTP countdown timer
  useEffect(() => {
    if (otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiresIn]);

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    match: password === passwordConfirm && password.length > 0,
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isFormValid = firstName && lastName && phone.length >= 10 && email && isPasswordValid && consentTerms && consentPrivacy;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit form and request OTP
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setError('');
    setIsLoading(true);

    // Request OTP
    const response = await authApi.requestRegisterOtp(phone);
    
    if (response.success && response.otp_request_id) {
      setOtpRequestId(response.otp_request_id);
      setOtpExpiresIn(response.expires_in || 300);
      setDebugOtp(response.debug_otp || null);
      setShowOtpModal(true);
    } else {
      setError(response.message || 'ไม่สามารถส่ง OTP ได้');
    }
    
    setIsLoading(false);
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpRequestId || otp.length !== 6) return;
    
    setError('');
    setIsLoading(true);

    const response = await authApi.register({
      otp_request_id: otpRequestId,
      otp,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirmation: passwordConfirm,
      consent_terms: consentTerms,
      consent_privacy: consentPrivacy,
      consent_marketing: consentMarketing,
    });
    
    if (response.success && response.token && response.member) {
      api.setToken(response.token);
      setMember(response.member);
      router.push('/member');
    } else {
      if (response.errors) {
        const firstError = Object.values(response.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(response.message || 'สมัครสมาชิกไม่สำเร็จ');
      }
    }
    
    setIsLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    setOtp('');

    const response = await authApi.requestRegisterOtp(phone);
    
    if (response.success && response.otp_request_id) {
      setOtpRequestId(response.otp_request_id);
      setOtpExpiresIn(response.expires_in || 300);
      setDebugOtp(response.debug_otp || null);
    } else {
      setError(response.message || 'ไม่สามารถส่ง OTP ได้');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-start justify-center pt-8 p-1">
        <Image
          src="https://imagedelivery.net/yixdo-GXTcyjkoSkBzfBcA/gallery-69845602c9a64-1770280450/public"
          alt="Travel"
          width={600}
          height={700}
          quality={100}
          className="object-cover rounded-2xl max-h-[75vh] w-auto"
          priority
        />
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
        <div className="flex-1 flex items-start justify-center pt-16 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                สร้างบัญชีผู้ใช้
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{' '}
                <Link href="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-2xl">
              {/* Error Message */}
              {error && !showOtpModal && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                      placeholder="ชื่อ"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์มือถือ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                      placeholder="เบอร์มือถือ"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                      placeholder="อีเมล"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      รหัสผ่าน <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full px-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                        placeholder="รหัสผ่าน"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                      ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="passwordConfirm"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        className="block w-full px-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                        placeholder="ยืนยันรหัสผ่าน"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirements - Compact */}
                {password && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">รหัสผ่านต้องประกอบด้วย:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <PasswordCheck valid={passwordChecks.length} text="8 ตัวอักษร" />
                      <PasswordCheck valid={passwordChecks.lowercase} text="พิมพ์เล็ก (a-z)" />
                      <PasswordCheck valid={passwordChecks.uppercase} text="พิมพ์ใหญ่ (A-Z)" />
                      <PasswordCheck valid={passwordChecks.number} text="ตัวเลข (0-9)" />
                      <PasswordCheck valid={passwordChecks.special} text="อักขระพิเศษ" />
                      <PasswordCheck valid={passwordChecks.match} text="รหัสตรงกัน" />
                    </div>
                  </div>
                )}

                {/* Consent Checkboxes */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentMarketing}
                      onChange={(e) => setConsentMarketing(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      ต้องการรับข่าวสารและโปรโมชั่นผ่านทางอีเมลและ SMS
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      required
                      className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      ยอมรับ{' '}
                      <Link href="/terms" className="text-[var(--color-primary)] hover:underline" target="_blank">
                        ข้อกำหนดและเงื่อนไขการใช้บริการ
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentPrivacy}
                      onChange={(e) => setConsentPrivacy(e.target.checked)}
                      required
                      className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      ยอมรับ{' '}
                      <Link href="/privacy" className="text-[var(--color-primary)] hover:underline" target="_blank">
                        นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy policy)
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'สร้างบัญชีผู้ใช้'
                  )}
                </button>
              </form>
            </div>

            {/* Mobile Benefits - shown only on mobile */}
            <div className="mt-6 lg:hidden bg-gradient-to-r from-[var(--color-primary)] to-blue-800 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">สิทธิพิเศษสำหรับสมาชิก</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm">รับส่วนลดสูงสุด 5,000 บาท</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm">สะสมแต้มแลกของรางวัลฟรี</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm">รับโปรโมชั่นพิเศษก่อนใคร</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยัน OTP</h3>
            <p className="text-sm text-gray-600 mb-6">
              เราได้ส่งรหัส OTP ไปยังหมายเลข <span className="font-medium">{phone}</span>
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Debug OTP (when debug mode is enabled in settings) */}
            {debugOtp && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                <span className="font-medium">[Debug Mode]</span> รหัส OTP: <span className="font-mono font-bold">{debugOtp}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  รหัส OTP (6 หลัก)
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                  placeholder="••••••"
                />
                {otpExpiresIn > 0 ? (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    รหัส OTP จะหมดอายุใน {formatTime(otpExpiresIn)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-red-500 text-center">
                    รหัส OTP หมดอายุแล้ว
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp('');
                    setError('');
                  }}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังตรวจสอบ...</span>
                    </>
                  ) : (
                    'ยืนยัน'
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || otpExpiresIn > 240}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  ส่งรหัส OTP อีกครั้ง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
