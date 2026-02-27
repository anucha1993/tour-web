'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, pageContentApi } from '@/lib/api';

type LoginMethod = 'password' | 'otp';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithOtp, isAuthenticated } = useAuth();
  
  const [method, setMethod] = useState<LoginMethod>('password');
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpRequestId, setOtpRequestId] = useState<number | null>(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Custom Background State
  const [bgImage, setBgImage] = useState('https://imagedelivery.net/yixdo-GXTcyjkoSkBzfBcA/gallery-69845602c9a64-1770280450/public');
  const [bgAlt, setBgAlt] = useState('Travel');
  const [bgTitle, setBgTitle] = useState('');

  const redirectTo = searchParams.get('redirect') || '/member';

  // Fetch Page Content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await pageContentApi.get('login_page');
        if (response.success && response.data?.content) {
          try {
            const content = JSON.parse(response.data.content);
            if (content.image_url) {
              setBgImage(content.image_url);
              setBgAlt(content.alt || 'Login Background');
              setBgTitle(content.title || '');
            }
          } catch (e) {
            console.error('Error parsing login page content:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching login page content:', err);
      }
    };
    fetchContent();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // OTP countdown timer
  useEffect(() => {
    if (otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiresIn]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(loginValue, password);
    
    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
    
    setIsLoading(false);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await authApi.requestLoginOtp(loginValue);
    
    if (response.success && response.otp_request_id) {
      setOtpRequestId(response.otp_request_id);
      setOtpExpiresIn(response.expires_in || 300);
      setSuccess('ส่ง OTP ไปยังหมายเลขโทรศัพท์แล้ว');
    } else {
      setError(response.message || 'ไม่สามารถส่ง OTP ได้');
    }
    
    setIsLoading(false);
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpRequestId) return;
    
    setError('');
    setIsLoading(true);

    const result = await loginWithOtp(otpRequestId, otp);
    
    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.message || 'OTP ไม่ถูกต้อง');
    }
    
    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-start justify-center pt-8 p-1">
        <Image
          src={bgImage}
          alt={bgAlt}
          title={bgTitle || bgAlt}
          width={600}
          height={600}
          quality={100}
          className="object-cover rounded-2xl max-h-[75vh] w-auto"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
        <div className="flex-1 flex items-start justify-center pt-16 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                เข้าสู่ระบบ
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                หรือ{' '}
                <Link href="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-2xl">
              {/* Login Method Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('password');
                    setError('');
                    setOtpRequestId(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    method === 'password'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  รหัสผ่าน
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('otp');
                    setError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    method === 'otp'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  OTP
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                  {success}
                </div>
              )}

              {/* Password Login Form */}
              {method === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-5">
                  <div>
                    <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมล หรือ เบอร์โทรศัพท์
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="login"
                        type="text"
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
                        required
                        autoComplete="off"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                        placeholder="email@example.com หรือ 0812345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                        placeholder="••••••••"
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        จดจำฉัน
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                    >
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        เข้าสู่ระบบ
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OTP Login Form */}
              {method === 'otp' && !otpRequestId && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
                        required
                        autoComplete="off"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                        placeholder="0812345678"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        ขอรหัส OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OTP Verification Form */}
              {method === 'otp' && otpRequestId && (
                <form onSubmit={handleOtpLogin} className="space-y-5">
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
                      autoComplete="one-time-code"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                      placeholder="••••••"
                    />
                    {otpExpiresIn > 0 && (
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        รหัส OTP จะหมดอายุใน {formatTime(otpExpiresIn)}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        ยืนยัน OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequestId(null);
                      setOtp('');
                      setSuccess('');
                    }}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← กลับไปกรอกเบอร์โทรศัพท์ใหม่
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
