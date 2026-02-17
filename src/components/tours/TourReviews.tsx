'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ChevronDown, MessageCircle, User } from 'lucide-react';
import { TourReview, ReviewSummary, CategoryRatings } from '@/lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  guide: 'ไกด์',
  food: 'อาหาร',
  hotel: 'ที่พัก',
  value: 'ความคุ้มค่า',
  program_accuracy: 'โปรแกรมตรงปก',
  would_return: 'อยากกลับไปอีก',
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : star - 0.5 <= rating
              ? 'fill-yellow-200 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-gray-600">{star}</span>
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-500">{count}</span>
    </div>
  );
}

interface ReviewCardProps {
  review: TourReview;
  onHelpful: (id: number) => void;
}

function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const displayName = review.reviewer_name || 'สมาชิก';
  const initial = displayName.charAt(0).toUpperCase();
  const createdDate = new Date(review.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        {review.reviewer_avatar_url ? (
          <img
            src={review.reviewer_avatar_url}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-sm">{initial}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h4 className="font-medium text-gray-900 text-sm">{displayName}</h4>
            <span className="text-xs text-gray-400">{createdDate}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={review.rating} />
            {review.is_featured && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                แนะนำ
              </span>
            )}
            {review.tour_type && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                review.tour_type === 'corporate' ? 'bg-purple-100 text-purple-700'
                : review.tour_type === 'private' ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {review.tour_type === 'corporate' ? '🏢 กรุ๊ปบริษัท' : review.tour_type === 'private' ? '👨‍👩‍👧‍👦 เหมาส่วนตัว' : '👤 บุคคล/ทั่วไป'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Category Ratings (expandable) */}
      {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <span>คะแนนรายหมวด</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {Object.entries(review.category_ratings).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500">{CATEGORY_LABELS[key] || key}</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="ml-0.5 font-medium">{val}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Reply */}
      {review.admin_reply && (
        <div className="mt-3 bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">ตอบกลับจากผู้ดูแล</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">{review.admin_reply}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end mt-3">
        <button
          onClick={() => onHelpful(review.id)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>มีประโยชน์ {review.helpful_count > 0 ? `(${review.helpful_count})` : ''}</span>
        </button>
      </div>
    </div>
  );
}

// ==================== Main Component ====================

interface TourReviewsProps {
  tourSlug: string;
  summary: ReviewSummary;
  reviews: TourReview[];
  totalReviews: number;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  onRatingFilter: (rating: number | null) => void;
  onHelpful: (reviewId: number) => void;
  activeSort: string;
  activeRating: number | null;
}

export default function TourReviews({
  summary,
  reviews,
  totalReviews,
  currentPage,
  lastPage,
  onPageChange,
  onSortChange,
  onRatingFilter,
  onHelpful,
  activeSort,
  activeRating,
}: TourReviewsProps) {
  const sortOptions = [
    { value: 'latest', label: 'ล่าสุด' },
    { value: 'highest', label: 'คะแนนสูงสุด' },
    { value: 'lowest', label: 'คะแนนต่ำสุด' },
    { value: 'helpful', label: 'มีประโยชน์มากสุด' },
  ];

  if (summary.total_reviews === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">ยังไม่มีรีวิวสำหรับทัวร์นี้</p>
        <p className="text-gray-400 text-xs mt-1">เป็นคนแรกที่รีวิว!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Overall Rating */}
          <div className="text-center sm:text-left flex-shrink-0">
            <div className="text-5xl font-bold text-gray-900">{summary.average_rating}</div>
            <StarRating rating={summary.average_rating} size="md" />
            <p className="text-sm text-gray-500 mt-1">
              จาก {summary.total_reviews} รีวิว
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => onRatingFilter(activeRating === star ? null : star)}
                className={`w-full transition-opacity ${
                  activeRating !== null && activeRating !== star ? 'opacity-40' : ''
                }`}
              >
                <RatingBar
                  star={star}
                  count={summary.rating_distribution[star] || 0}
                  total={summary.total_reviews}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Category Averages */}
        {Object.keys(summary.category_averages).length > 0 && (
          <div className="mt-5 pt-5 border-t border-blue-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">คะแนนรายหมวด</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(summary.category_averages).map(([key, avg]) => (
                <div key={key} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-600">{CATEGORY_LABELS[key] || key}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort & Filter Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-base font-semibold text-gray-900">
          รีวิวทั้งหมด ({totalReviews})
        </h3>
        <div className="flex items-center gap-2">
          {activeRating && (
            <button
              onClick={() => onRatingFilter(null)}
              className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full hover:bg-red-100"
            >
              ล้างตัวกรอง ×
            </button>
          )}
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onHelpful={onHelpful} />
        ))}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ก่อนหน้า
          </button>
          <span className="text-sm text-gray-500">
            {currentPage} / {lastPage}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
