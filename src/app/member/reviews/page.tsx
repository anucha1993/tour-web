<<<<<<< HEAD
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reviewApi, TourReview, ReviewTag } from "@/lib/api";
import { API_URL } from "@/lib/config";
import {
  StarIcon,
  PlusIcon,
  PhotoIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface TourSearchResult {
  id: number;
  tour_name: string;
  slug: string;
  tour_code: string;
}

const STATUS_MAP: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: "รอตรวจสอบ", icon: ClockIcon, color: "text-yellow-600 bg-yellow-50" },
  approved: { label: "อนุมัติแล้ว", icon: CheckCircleIcon, color: "text-green-600 bg-green-50" },
  rejected: { label: "ไม่อนุมัติ", icon: XCircleIcon, color: "text-red-600 bg-red-50" },
};

const CATEGORY_LABELS: Record<string, string> = {
  guide: "ไกด์นำเที่ยว",
  food: "อาหาร",
  hotel: "โรงแรม",
  value: "ความคุ้มค่า",
  program_accuracy: "โปรแกรมตรงปก",
  would_return: "กลับมาอีก",
};

export default function MemberReviews() {
  const { member } = useAuth();
  const [myReviews, setMyReviews] = useState<TourReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);

  // Tour search
  const [tourSearch, setTourSearch] = useState("");
  const [tourResults, setTourResults] = useState<TourSearchResult[]>([]);
  const [tourSearching, setTourSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedTour, setSelectedTour] = useState<TourSearchResult | null>(null);

  // Review form
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [availableTags, setAvailableTags] = useState<ReviewTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetchMyReviews();
    fetchTags();
  }, []);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.myReviews() as { success?: boolean; data?: { data?: TourReview[] } };
      if (res.success) {
        setMyReviews(res.data?.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await reviewApi.tags() as { success?: boolean; data?: ReviewTag[] };
      if (res.success) {
        setAvailableTags(res.data || []);
      }
    } catch {
      // ignore
    }
  };

  const handleTourSearch = (query: string) => {
    setTourSearch(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setTourResults([]);
      return;
    }
    setTourSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("member_token") : null;
        const res = await fetch(`${API_URL}/tours/international?search=${encodeURIComponent(query)}&per_page=8`, {
          headers: {
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const data = await res.json();
        if (data.success) {
          setTourResults(
            (data.data?.data || []).map((t: TourSearchResult & Record<string, unknown>) => ({
              id: t.id,
              tour_name: t.tour_name || t.title || '',
              slug: t.slug,
              tour_code: t.tour_code || "",
            }))
          );
        }
      } catch {
        // ignore
      } finally {
        setTourSearching(false);
      }
    }, 300);
  };

  const handleSelectTour = (tour: TourSearchResult) => {
    setSelectedTour(tour);
    setTourSearch("");
    setTourResults([]);
  };

  const resetForm = () => {
    setSelectedTour(null);
    setCategoryRatings({});
    setComment("");
    setReviewImages([]);
    setAvatarFile(null);
    setSelectedTags([]);
    setTourSearch("");
    setTourResults([]);
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (!selectedTour) {
      setErrorMsg("กรุณาเลือกทัวร์");
      return;
    }
    // Compute average rating from category ratings
    const catVals = Object.values(categoryRatings).map(Number).filter(v => v > 0);
    const avgRating = catVals.length ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length) : 0;
    if (catVals.length === 0) {
      setErrorMsg("กรุณาให้คะแนนตามหมวดหมู่อย่างน้อย 1 หมวด");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("กรุณาเขียนความคิดเห็น");
      return;
    }
    if (reviewImages.length === 0) {
      setErrorMsg("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("rating", String(avgRating));
      fd.append("comment", comment);
      Object.entries(categoryRatings).forEach(([k, v]) => {
        fd.append(`category_ratings[${k}]`, String(v));
      });
      selectedTags.forEach((tag) => fd.append("tags[]", tag));
      reviewImages.forEach((file) => fd.append("images[]", file));
      if (avatarFile) fd.append("reviewer_avatar", avatarFile);

      const res = await reviewApi.store(selectedTour.slug, fd);
      if (res.success) {
        setSuccessMsg("ส่งรีวิวสำเร็จ จะแสดงผลหลังจากตรวจสอบ");
        resetForm();
        setShowWriteForm(false);
        fetchMyReviews();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        const errors = res.errors
          ? Object.values(res.errors).flat().join("\n")
          : res.message || "เกิดข้อผิดพลาด";
        setErrorMsg(errors);
      }
    } catch {
      setErrorMsg("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, onClick?: (v: number) => void, onHover?: (v: number) => void, hover?: number, size = "w-5 h-5") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const active = s <= (hover && hover > 0 ? hover : value);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onClick?.(s)}
              onMouseEnter={() => onHover?.(s)}
              onMouseLeave={() => onHover?.(0)}
              className={onClick ? "cursor-pointer" : "cursor-default"}
              disabled={!onClick}
            >
              {active ? (
                <StarIconSolid className={`${size} text-yellow-400`} />
              ) : (
                <StarIcon className={`${size} text-gray-300 ${onClick ? "hover:text-yellow-200" : ""}`} />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (!member) return null;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <StarIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">รีวิวของฉัน</h1>
            <p className="text-sm text-gray-500">เขียนรีวิวและดูรีวิวที่คุณเคยเขียน</p>
          </div>
        </div>
        {!showWriteForm && (
          <button
            onClick={() => { resetForm(); setShowWriteForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            เขียนรีวิว
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Write Review Form */}
      {showWriteForm && (
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">เขียนรีวิวทัวร์</h2>
            <button onClick={() => { resetForm(); setShowWriteForm(false); }} className="p-1 hover:bg-gray-200 rounded-lg">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Error */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Tour Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เลือกทัวร์ <span className="text-red-500">*</span></label>
              {selectedTour ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm text-blue-800 font-medium">{selectedTour.tour_name}</div>
                    {selectedTour.tour_code && (
                      <div className="text-xs text-blue-500 mt-0.5">รหัส: {selectedTour.tour_code}</div>
                    )}
                  </div>
                  <button onClick={() => setSelectedTour(null)} className="p-1 hover:bg-blue-100 rounded">
                    <XMarkIcon className="w-4 h-4 text-blue-500" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tourSearch}
                    onChange={(e) => handleTourSearch(e.target.value)}
                    placeholder="พิมพ์ชื่อทัวร์เพื่อค้นหา..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {(tourResults.length > 0 || tourSearching) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {tourSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">กำลังค้นหา...</div>
                      ) : (
                        tourResults.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleSelectTour(t)}
                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                          >
                            <div className="font-medium text-gray-900">{t.tour_name}</div>
                            {t.tour_code && <div className="text-xs text-gray-500 mt-0.5">รหัส: {t.tour_code}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รูปโปรไฟล์ <span className="text-xs text-gray-400">(ไม่บังคับ, ไม่เกิน 2MB)</span></label>
              <div className="flex items-center gap-4">
                <label className="relative block w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 flex-shrink-0">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <PhotoIcon className="w-5 h-5 text-gray-300" />
                      <span className="text-[8px] text-gray-400 mt-0.5">เลือกรูป</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {avatarFile ? (
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 truncate">{avatarFile.name}</p>
                    <button
                      type="button"
                      onClick={() => setAvatarFile(null)}
                      className="text-xs text-red-400 hover:text-red-600 mt-0.5"
                    >ลบรูป</button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">อัปโหลดรูปโปรไฟล์ของคุณเพื่อแสดงในรีวิว</p>
                )}
              </div>
            </div>

            {/* Overall Rating (auto-computed) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนรวม <span className="text-xs text-gray-400">(คำนวณจากค่าเฉลี่ย)</span></label>
              {(() => {
                const catVals = Object.values(categoryRatings).map(Number).filter(v => v > 0);
                const avg = catVals.length ? parseFloat((catVals.reduce((a, b) => a + b, 0) / catVals.length).toFixed(1)) : 0;
                const full = Math.floor(avg);
                const hasHalf = avg !== full && avg > 0;
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => {
                        if (s <= full) return <StarIconSolid key={s} className="w-8 h-8 text-yellow-400" />;
                        if (s === full + 1 && hasHalf) return (
                          <div key={s} className="relative w-8 h-8">
                            <StarIcon className="w-8 h-8 text-gray-300 absolute" />
                            <div className="overflow-hidden w-1/2 absolute">
                              <StarIconSolid className="w-8 h-8 text-yellow-400" />
                            </div>
                          </div>
                        );
                        return <StarIcon key={s} className="w-8 h-8 text-gray-300" />;
                      })}
                    </div>
                    {avg > 0 && <span className="text-sm font-semibold text-yellow-600 ml-1">{avg}/5</span>}
                    {avg === 0 && <span className="text-sm text-gray-400 ml-1">ยังไม่มีคะแนน</span>}
                  </div>
                );
              })()}
            </div>

            {/* Category Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนตามหมวดหมู่ <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-gray-600">{label}</span>
                    {renderStars(
                      categoryRatings[key] || 0,
                      (v) => setCategoryRatings((prev) => ({ ...prev, [key]: v })),
                      undefined,
                      undefined,
                      "w-4 h-4"
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <HashtagIcon className="w-4 h-4" />
                  แฮชแท็ก <span className="text-xs text-gray-400">(ไม่บังคับ)</span>
                </label>
                {/* Selected tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        #{tag}
                        <button type="button" onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} className="p-0.5 hover:bg-blue-200 rounded-full">
                          <XMarkIcon className="w-3 h-3" />
                        </button>
=======
'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { reviewApi, TourReview } from '@/lib/api';
import { API_URL } from '@/lib/config';

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'รอตรวจสอบ', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  approved: { label: 'แสดงผลแล้ว', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  rejected: { label: 'ไม่อนุมัติ', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchMyReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewApi.myReviews(currentPage);
        if (res.success && res.data) {
          setReviews(res.data.data);
          setLastPage(res.data.last_page);
          setTotal(res.data.total);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    fetchMyReviews();
  }, [currentPage]);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL?.replace('/api', '')}${path}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            รีวิวของฉัน
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0 ? `คุณมี ${total} รีวิว` : 'ยังไม่มีรีวิว'}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">กำลังโหลด...</p>
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีรีวิว</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            หลังจากเดินทางกับเรา มาแชร์ประสบการณ์ให้เพื่อนๆ ได้เลย!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            ดูทัวร์ทั้งหมด
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Reviews List */
        <div className="space-y-4">
          {reviews.map((review) => {
            const statusInfo = STATUS_MAP[review.status];
            const StatusIcon = statusInfo.icon;
            const tourImg = getImageUrl(review.tour?.cover_image);

            return (
              <div key={review.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                {/* Tour Info */}
                <div className="flex gap-3 mb-3">
                  {tourImg ? (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                      <Image
                        src={tourImg}
                        alt={review.tour?.tour_name || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/tours/${review.tour?.slug || ''}`}
                      className="text-sm font-medium text-gray-900 hover:text-[var(--color-primary)] line-clamp-2 transition-colors"
                    >
                      {review.tour?.tour_name || 'ทัวร์'}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <StarDisplay rating={review.rating} />
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">{review.comment}</p>
                )}

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {review.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        #{tag}
>>>>>>> bccb552b38071e57b0ca484bf8d027b1a2ae03b0
                      </span>
                    ))}
                  </div>
                )}
<<<<<<< HEAD
                {/* Suggested tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.filter(t => t.is_active).map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    if (isSelected) return null;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setSelectedTags(prev => [...prev, tag.name])}
                        className="px-3 py-1.5 rounded-full text-xs border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
                {/* Custom tag input */}
                <input
                  type="text"
                  placeholder="พิมพ์แฮชแท็กแล้วกด Enter เช่น ญี่ปุ่น, ครอบครัว"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.replace(/[#,]/g, '').trim();
                      if (val && !selectedTags.includes(val)) {
                        setSelectedTags(prev => [...prev, val]);
                      }
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            )}

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ความคิดเห็น <span className="text-red-500">*</span></label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="เขียนรีวิวของคุณ..."
                rows={4}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{comment.length}/200</div>
            </div>

            {/* Review Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                รูปภาพรีวิว <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-1">(อย่างน้อย 1 รูป, สูงสุด 6 รูป, ภาพละไม่เกิน 5MB)</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {reviewImages.map((file, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReviewImages((imgs) => imgs.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {reviewImages.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors">
                    <PhotoIcon className="w-6 h-6 text-gray-300 mb-1" />
                    <span className="text-[10px] text-gray-400">เพิ่มรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setReviewImages((prev) => [...prev, ...files].slice(0, 6));
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { resetForm(); setShowWriteForm(false); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  "ส่งรีวิว"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded mb-2" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : myReviews.length === 0 ? (
        <div className="text-center py-16">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium mb-1">ยังไม่มีรีวิว</h3>
          <p className="text-sm text-gray-400">เขียนรีวิวเพื่อแบ่งปันประสบการณ์ทัวร์ของคุณ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myReviews.map((review) => {
            const status = STATUS_MAP[review.status] || STATUS_MAP.pending;
            const StatusIcon = status.icon;
            return (
              <div key={review.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-5">
                  {/* Tour name + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {review.tour?.title || "ทัวร์"}
                      </h3>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(review.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">{review.rating}/5</span>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                      {review.images.map((img) => (
                        <img
                          key={img.id}
                          src={img.image_url.startsWith("http") ? img.image_url : `${API_URL.replace('/api', '')}${img.image_url}`}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {review.tags.map((tag, i) => {
                        const found = availableTags.find(t => t.slug === tag || t.name === tag);
                        const displayName = found ? found.name : tag;
                        return (
                          <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            #{displayName}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Admin reply */}
                  {review.admin_reply && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="text-xs font-medium text-blue-700 mb-1">ตอบกลับจากทีมงาน</div>
                      <p className="text-sm text-blue-800">{review.admin_reply}</p>
                    </div>
                  )}

                  {/* Rejection reason */}
                  {review.status === "rejected" && (review as TourReview & { rejection_reason?: string }).rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div className="text-xs font-medium text-red-700 mb-1">เหตุผลที่ไม่อนุมัติ</div>
                      <p className="text-sm text-red-800">{(review as TourReview & { rejection_reason?: string }).rejection_reason}</p>
                    </div>
                  )}
=======

                {/* Admin Reply */}
                {review.admin_reply && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-medium text-blue-700 mb-1">💬 ตอบกลับจากผู้ดูแล</p>
                    <p className="text-xs text-blue-800">{review.admin_reply}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  <Link
                    href={`/tours/${review.tour?.slug || ''}`}
                    className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    ดูทัวร์ <ChevronRight className="w-3 h-3" />
                  </Link>
>>>>>>> bccb552b38071e57b0ca484bf8d027b1a2ae03b0
                </div>
              </div>
            );
          })}
<<<<<<< HEAD
=======

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ก่อนหน้า
              </button>
              <span className="text-sm text-gray-500">{currentPage} / {lastPage}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ถัดไป
              </button>
            </div>
          )}
>>>>>>> bccb552b38071e57b0ca484bf8d027b1a2ae03b0
        </div>
      )}
    </div>
  );
}
