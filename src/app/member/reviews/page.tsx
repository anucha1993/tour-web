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
                      </span>
                    ))}
                  </div>
                )}

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
                </div>
              </div>
            );
          })}

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
        </div>
      )}
    </div>
  );
}
