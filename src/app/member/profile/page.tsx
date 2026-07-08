"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  CameraIcon,
  TrashIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

type LinkedAccountState = {
  has_password: boolean;
  google: { linked: boolean; linked_at: string | null };
  facebook: { linked: boolean; linked_at: string | null };
  line: { linked: boolean; linked_at: string | null };
};

type Provider = "google" | "facebook" | "line";

const PROVIDER_LABEL: Record<Provider, { name: string; color: string; icon: string }> = {
  google: { name: "Google", color: "bg-white border-gray-300 text-gray-700", icon: "G" },
  facebook: { name: "Facebook", color: "bg-[#1877F2] text-white border-[#1877F2]", icon: "f" },
  line: { name: "LINE", color: "bg-[#06C755] text-white border-[#06C755]", icon: "L" },
};

export default function MemberProfile() {
  const { member, refreshMember, logout } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    line_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccountState | null>(null);
  const [providerActionLoading, setProviderActionLoading] = useState<Provider | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Change password
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLinkedAccounts = useCallback(async () => {
    const res = await authApi.getLinkedAccounts();
    if (res.success && res.data) {
      setLinkedAccounts(res.data as LinkedAccountState);
    }
  }, []);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        line_id: member.line_id || "",
      });
    }
  }, [member]);

  useEffect(() => {
    loadLinkedAccounts();
  }, [loadLinkedAccounts]);

  // Handle OAuth return for linking
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const linkParam = url.searchParams.get("link");
    const savedProvider = sessionStorage.getItem("link_provider") as Provider | null;
    const savedRedirect = sessionStorage.getItem("link_redirect_uri");
    if (code && linkParam && savedProvider && savedRedirect && linkParam === savedProvider) {
      sessionStorage.removeItem("link_provider");
      sessionStorage.removeItem("link_redirect_uri");
      window.history.replaceState({}, "", "/member/profile");
      (async () => {
        setProviderActionLoading(savedProvider);
        const res = await authApi.linkSocial(savedProvider, code, savedRedirect);
        if (res.success) {
          await loadLinkedAccounts();
          await refreshMember();
          setMessage({ type: "success", text: res.message || "เชื่อมต่อสำเร็จ" });
        } else {
          setMessage({ type: "error", text: res.message || "เชื่อมต่อไม่สำเร็จ" });
        }
        setProviderActionLoading(null);
      })();
    }
  }, [loadLinkedAccounts, refreshMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await authApi.updateProfile(formData);
      if (response.success) {
        await refreshMember();
        setMessage({ type: "success", text: "บันทึกข้อมูลเรียบร้อยแล้ว" });
      } else {
        setMessage({ type: "error", text: response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "ขนาดไฟล์ต้องไม่เกิน 5MB" });
      return;
    }
    setIsUploadingAvatar(true);
    setMessage(null);
    try {
      const res = await authApi.uploadAvatar(file);
      if (res.success) {
        await refreshMember();
        setMessage({ type: "success", text: "อัปโหลดรูปสำเร็จ" });
      } else {
        setMessage({ type: "error", text: res.message || "อัปโหลดไม่สำเร็จ" });
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!confirm("ลบรูปโปรไฟล์ใช่ไหม?")) return;
    setIsUploadingAvatar(true);
    setMessage(null);
    try {
      const res = await authApi.deleteAvatar();
      if (res.success) {
        await refreshMember();
        setMessage({ type: "success", text: "ลบรูปเรียบร้อย" });
      } else {
        setMessage({ type: "error", text: res.message || "ลบไม่สำเร็จ" });
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleStartLink = async (provider: Provider) => {
    setProviderActionLoading(provider);
    try {
      const redirectUri = `${window.location.origin}/member/profile?link=${provider}`;
      const res = await authApi.getSocialRedirectUrl(provider, redirectUri);
      const url = (res.data as { url?: string } | undefined)?.url;
      if (res.success && url) {
        sessionStorage.setItem("link_provider", provider);
        sessionStorage.setItem("link_redirect_uri", redirectUri);
        window.location.href = url;
      } else {
        setMessage({ type: "error", text: res.message || "ไม่สามารถเริ่มการเชื่อมต่อได้" });
        setProviderActionLoading(null);
      }
    } catch {
      setProviderActionLoading(null);
    }
  };

  const handleUnlink = async (provider: Provider) => {
    if (!confirm(`ยกเลิกการเชื่อมต่อ ${PROVIDER_LABEL[provider].name}?`)) return;
    setProviderActionLoading(provider);
    setMessage(null);
    try {
      const res = await authApi.unlinkSocial(provider);
      if (res.success) {
        await loadLinkedAccounts();
        await refreshMember();
        setMessage({ type: "success", text: res.message || "ยกเลิกการเชื่อมต่อเรียบร้อย" });
      } else {
        setMessage({ type: "error", text: res.message || "ไม่สามารถยกเลิกได้" });
      }
    } finally {
      setProviderActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("กรุณาพิมพ์ DELETE เพื่อยืนยัน");
      return;
    }
    if (linkedAccounts?.has_password && !deletePassword) {
      setDeleteError("กรุณากรอกรหัสผ่าน");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await authApi.deleteAccount(deletePassword, deleteConfirmText);
      if (res.success) {
        await logout();
        alert("ลบบัญชีเรียบร้อย ขอบคุณที่ใช้บริการ");
        router.push("/");
      } else {
        setDeleteError(res.message || "ไม่สามารถลบบัญชีได้");
      }
    } catch {
      setDeleteError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwMessage({ type: "error", text: "กรุณากรอกข้อมูลให้ครบ" });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage({ type: "error", text: "ยืนยันรหัสผ่านใหม่ไม่ตรงกัน" });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwMessage({ type: "error", text: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" });
      return;
    }
    setIsChangingPw(true);
    try {
      const res = await authApi.changePassword({
        current_password: pwForm.current,
        new_password: pwForm.next,
        new_password_confirmation: pwForm.confirm,
      }) as { success?: boolean; message?: string; errors?: Record<string, string[]> };
      if (res.success) {
        setPwMessage({ type: "success", text: res.message || "เปลี่ยนรหัสผ่านสำเร็จ" });
        setPwForm({ current: "", next: "", confirm: "" });
        await loadLinkedAccounts();
        setTimeout(() => setPwMessage(null), 5000);
      } else {
        const errText = res.errors
          ? Object.values(res.errors).flat().join("\n")
          : res.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้";
        setPwMessage({ type: "error", text: errText });
      }
    } catch {
      setPwMessage({ type: "error", text: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setIsChangingPw(false);
    }
  };

  if (!member) return null;

  const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <UserIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h1>
          <p className="text-sm text-gray-500">จัดการข้อมูลบัญชีของคุณ</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 mb-4 max-w-5xl ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-current opacity-50 hover:opacity-100">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Avatar + Account Info */}
      <div className="bg-white max-w-5xl rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">รูปโปรไฟล์ และข้อมูลบัญชี</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
                  {member.avatar ? (
                    <Image
                      src={member.avatar}
                      alt={member.full_name || "avatar"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarSelect}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 bg-[var(--color-primary)] text-white rounded-full p-2 shadow-md hover:bg-orange-600 transition disabled:opacity-50 cursor-pointer"
                  title="เปลี่ยนรูป"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {member.avatar && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={isUploadingAvatar}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <TrashIcon className="w-3 h-3" />
                  ลบรูป
                </button>
              )}
              {isUploadingAvatar && <span className="text-xs text-gray-500">กำลังดำเนินการ...</span>}
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <PhoneIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{member.phone}</span>
                {member.is_verified && (
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircleIcon className="w-4 h-4" />
                    ยืนยันแล้ว
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                * ไม่สามารถเปลี่ยนเบอร์โทรศัพท์ได้ เนื่องจากใช้ในการยืนยันตัวตน
              </p>
              <p className="text-xs text-gray-500">รองรับ JPG, PNG, WebP — ขนาดไม่เกิน 5MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white max-w-5xl rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                placeholder="ชื่อ"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1.5">นามสกุล</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                placeholder="นามสกุล"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                อีเมล
              </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="line_id" className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-4 h-4 text-gray-500" />
                LINE ID
              </span>
            </label>
            <input
              type="text"
              id="line_id"
              name="line_id"
              value={formData.line_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
              placeholder="@lineid หรือ lineid"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                กำลังบันทึก...
              </span>
            ) : (
              "บันทึกข้อมูล"
            )}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <div className="bg-white max-w-5xl rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">เปลี่ยนรหัสผ่าน</h2>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {linkedAccounts && !linkedAccounts.has_password && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              บัญชีของคุณยังไม่มีรหัสผ่าน — โปรดใช้ฟอร์มลืมรหัสผ่านที่หน้าเข้าสู่ระบบเพื่อตั้งรหัสผ่านใหม่
            </div>
          )}
          {pwMessage && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                pwMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {pwMessage.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <span className="whitespace-pre-line">{pwMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { key: "current", label: "รหัสผ่านเดิม", placeholder: "กรอกรหัสผ่านปัจจุบัน" },
              { key: "next", label: "รหัสผ่านใหม่", placeholder: "อย่างน้อย 8 ตัวอักษร" },
              { key: "confirm", label: "ยืนยันรหัสผ่านใหม่", placeholder: "กรอกอีกครั้งให้ตรงกัน" },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={pwShow[key] ? "text" : "password"}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    autoComplete={key === "current" ? "current-password" : "new-password"}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    disabled={isChangingPw || (linkedAccounts ? !linkedAccounts.has_password : false)}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow({ ...pwShow, [key]: !pwShow[key] })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {pwShow[key] ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500">
            รหัสผ่านต้องมี: ตัวอักษรพิมพ์เล็ก, ตัวพิมพ์ใหญ่, ตัวเลข และอักขระพิเศษ ความยาวอย่างน้อย 8 ตัวอักษร
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPw || (linkedAccounts ? !linkedAccounts.has_password : false)}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <KeyIcon className="w-4 h-4" />
              {isChangingPw ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </div>
        </form>
      </div>

      {/* Linked Accounts */}
      <div className="bg-white max-w-5xl rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">บัญชีที่เชื่อมต่อ</h2>
        </div>
        <div className="p-6 space-y-3">
          {(["google", "facebook", "line"] as Provider[]).map((p) => {
            const meta = PROVIDER_LABEL[p];
            const status = linkedAccounts?.[p];
            const linked = !!status?.linked;
            const isLoading = providerActionLoading === p;
            return (
              <div key={p} className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{meta.name}</div>
                    <div className="text-xs text-gray-500">
                      {linked
                        ? `เชื่อมต่อแล้ว${status?.linked_at ? ` (${status.linked_at})` : ""}`
                        : "ยังไม่ได้เชื่อมต่อ"}
                    </div>
                  </div>
                </div>
                {linked ? (
                  <button
                    onClick={() => handleUnlink(p)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "..." : "ยกเลิก"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartLink(p)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "..." : "เชื่อมต่อ"}
                  </button>
                )}
              </div>
            );
          })}
          {linkedAccounts && !linkedAccounts.has_password && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              บัญชีของคุณยังไม่ได้ตั้งรหัสผ่าน — หากยกเลิกการเชื่อมต่อทั้งหมดอาจเข้าระบบไม่ได้ แนะนำให้ตั้งรหัสผ่านที่หน้า{" "}
              <a href="/member/change-password" className="underline">เปลี่ยนรหัสผ่าน</a>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white max-w-5xl rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <h2 className="font-semibold text-red-700">โซนอันตราย</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="font-medium text-gray-900 mb-1">ลบบัญชีของฉัน</div>
              <p className="text-sm text-gray-600">
                การลบบัญชีจะปิดใช้งานข้อมูลของคุณทั้งหมด รวมถึงประวัติการจอง คะแนน และข้อมูลส่วนตัว — ไม่สามารถกู้คืนได้
              </p>
            </div>
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setDeletePassword("");
                setDeleteConfirmText("");
                setDeleteError(null);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
            >
              ลบบัญชี
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">ยืนยันการลบบัญชี</h3>
                <p className="text-sm text-gray-600 mt-1">การกระทำนี้ไม่สามารถยกเลิกได้</p>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {linkedAccounts?.has_password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  พิมพ์ <span className="font-mono font-bold text-red-600">DELETE</span> เพื่อยืนยัน
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="DELETE"
                />
              </div>

              {deleteError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบบัญชีถาวร"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
