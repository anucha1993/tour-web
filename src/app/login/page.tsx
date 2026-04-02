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
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [socialStatus, setSocialStatus] = useState<{ google: boolean; facebook: boolean; line: boolean }>({ google: false, facebook: false, line: false });
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
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

  // Fetch OTP status & social auth status
  useEffect(() => {
    authApi.getOtpStatus().then((r) => {
      if (r.success && r.data) setOtpEnabled(r.data.enabled);
    }).catch(() => {});
    authApi.getSocialStatus().then((r) => {
      if (r.success && r.data) setSocialStatus(r.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!otpEnabled && method === 'otp') {
      setMethod('password');
      setOtp('');
      setOtpRequestId(null);
      setOtpExpiresIn(0);
      setSuccess('');
    }
  }, [otpEnabled, method]);

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

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'line') => {
    setSocialLoading(provider);
    setError('');
    try {
      const redirectUri = `${window.location.origin}/auth/${provider}/callback`;
      const res = await authApi.getSocialRedirectUrl(provider, redirectUri);
      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.message || `ไม่สามารถเชื่อมต่อ ${provider} ได้`);
        setSocialLoading(null);
      }
    } catch {
      setError(`เกิดข้อผิดพลาดในการเชื่อมต่อ ${provider}`);
      setSocialLoading(null);
    }
  };

  const hasSocial = socialStatus.google || socialStatus.facebook || socialStatus.line;

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
                  disabled={!otpEnabled}
                  onClick={() => {
                    if (!otpEnabled) return;
                    setMethod('otp');
                    setError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !otpEnabled
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : method === 'otp'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  OTP
                </button>
              </div>

              {!otpEnabled && (
                <p className="mb-6 text-xs text-gray-500">
                  OTP ถูกปิดใช้งานชั่วคราวระหว่างรอตรวจสอบการตั้งค่า
                </p>
              )}

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
              {otpEnabled && method === 'otp' && !otpRequestId && (
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
              {otpEnabled && method === 'otp' && otpRequestId && (
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

              {/* Social Login */}
              {hasSocial && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-gray-500">หรือเข้าสู่ระบบด้วย</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {socialStatus.google && (
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={socialLoading !== null}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {socialLoading === 'google' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        )}
                        เข้าสู่ระบบด้วย Google
                      </button>
                    )}

                    {socialStatus.facebook && (
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={socialLoading !== null}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-sm bg-[#1877F2] hover:bg-[#166FE5] text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {socialLoading === 'facebook' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        )}
                        เข้าสู่ระบบด้วย Facebook
                      </button>
                    )}

                    {socialStatus.line && (
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('line')}
                        disabled={socialLoading !== null}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-sm bg-[#06C755] hover:bg-[#05b64e] text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {socialLoading === 'line' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.101 14.479 24 12.515 24 10.304z"/>
                          </svg>
                        )}
                        เข้าสู่ระบบด้วย LINE
                      </button>
                    )}
                  </div>
                </div>
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
