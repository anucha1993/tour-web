"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { memberApi } from "@/lib/api";
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface BillingAddress {
  id: number;
  type: "personal" | "company";
  is_default: boolean;
  // Personal
  name?: string;
  // Company
  company_name?: string;
  tax_id?: string;
  branch_name?: string;
  // Common
  address: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  phone: string;
  email?: string;
}

type FormData = Omit<BillingAddress, "id">;

const initialFormData: FormData = {
  type: "personal",
  is_default: false,
  name: "",
  company_name: "",
  tax_id: "",
  branch_name: "",
  address: "",
  sub_district: "",
  district: "",
  province: "",
  postal_code: "",
  phone: "",
  email: "",
};

export default function BillingAddressPage() {
  const { member } = useAuth();
  const [addresses, setAddresses] = useState<BillingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await memberApi.getBillingAddresses();
      if (response.success && response.addresses) {
        setAddresses(response.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let response;
      if (editingId) {
        response = await memberApi.updateBillingAddress(editingId, formData);
      } else {
        response = await memberApi.createBillingAddress(formData);
      }

      if (response.success) {
        setMessage({
          type: "success",
          text: editingId ? "แก้ไขที่อยู่เรียบร้อยแล้ว" : "เพิ่มที่อยู่เรียบร้อยแล้ว",
        });
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        fetchAddresses();
      } else {
        setMessage({
          type: "error",
          text: response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: BillingAddress) => {
    setFormData({
      type: address.type,
      is_default: address.is_default,
      name: address.name || "",
      company_name: address.company_name || "",
      tax_id: address.tax_id || "",
      branch_name: address.branch_name || "",
      address: address.address,
      sub_district: address.sub_district,
      district: address.district,
      province: address.province,
      postal_code: address.postal_code,
      phone: address.phone,
      email: address.email || "",
    });
    setEditingId(address.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบที่อยู่นี้ใช่หรือไม่?")) return;

    try {
      const response = await memberApi.deleteBillingAddress(id);
      if (response.success) {
        setMessage({ type: "success", text: "ลบที่อยู่เรียบร้อยแล้ว" });
        fetchAddresses();
      } else {
        setMessage({
          type: "error",
          text: response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const response = await memberApi.setDefaultBillingAddress(id);
      if (response.success) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
    setMessage(null);
  };

  if (!member) return null;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MapPinIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ที่อยู่ใบกำกับภาษี</h1>
            <p className="text-sm text-gray-500">จัดการที่อยู่สำหรับออกใบเสนอราคาและใบกำกับภาษี</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            <span>เพิ่มที่อยู่</span>
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
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
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทที่อยู่
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="personal"
                    checked={formData.type === "personal"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[var(--color-primary)]"
                  />
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">บุคคลธรรมดา</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="company"
                    checked={formData.type === "company"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[var(--color-primary)]"
                  />
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">นิติบุคคล/บริษัท</span>
                </label>
              </div>
            </div>

            {/* Personal Fields */}
            {formData.type === "personal" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
            )}

            {/* Company Fields */}
            {formData.type === "company" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      ชื่อบริษัท <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="บริษัท xxx จำกัด"
                    />
                  </div>
                  <div>
                    <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1.5">
                      เลขผู้เสียภาษี <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="tax_id"
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleChange}
                      required
                      maxLength={13}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="0000000000000"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    สาขา
                  </label>
                  <input
                    type="text"
                    id="branch_name"
                    name="branch_name"
                    value={formData.branch_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="สำนักงานใหญ่"
                  />
                </div>
              </>
            )}

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                ที่อยู่ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                placeholder="เลขที่ ซอย ถนน"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sub_district" className="block text-sm font-medium text-gray-700 mb-1.5">
                  แขวง/ตำบล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sub_district"
                  name="sub_district"
                  value={formData.sub_district}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1.5">
                  เขต/อำเภอ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1.5">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1.5">
                  รหัสไปรษณีย์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  required
                  maxLength={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  เบอร์โทร <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="0812345678"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* Default */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-gray-700">ตั้งเป็นที่อยู่หลัก</span>
              </label>
            </div>
          </form>
          
          {/* Actions */}
          <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="billing-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 cursor-pointer font-medium"
              onClick={handleSubmit}
            >
              {isSubmitting ? "กำลังบันทึก..." : editingId ? "บันทึก" : "เพิ่มที่อยู่"}
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      {!showForm && (
        isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <MapPinIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">ยังไม่มีที่อยู่</h3>
            <p className="text-sm text-gray-500 mb-3">เพิ่มที่อยู่สำหรับออกใบเสนอราคาหรือใบกำกับภาษี</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>เพิ่มที่อยู่</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  address.is_default ? "border-[var(--color-primary)]" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {address.type === "company" ? (
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-medium text-gray-900 text-sm truncate">
                      {address.type === "company" ? address.company_name : address.name}
                    </span>
                    {address.is_default && (
                      <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded">
                        ที่อยู่หลัก
                      </span>
                    )}
                  </div>
                  {address.type === "company" && address.tax_id && (
                    <p className="text-sm text-gray-500 mb-1">
                      เลขประจำตัวผู้เสียภาษี: {address.tax_id}
                      {address.branch_name && ` (${address.branch_name})`}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.address} {address.sub_district} {address.district} {address.province}{" "}
                    {address.postal_code}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    โทร: {address.phone}
                    {address.email && ` | อีเมล: ${address.email}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs text-gray-500 hover:text-[var(--color-primary)] px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      ตั้งเป็นหลัก
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-lg cursor-pointer"
                    title="แก้ไข"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="ลบ"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
}
