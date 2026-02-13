'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { reviewApi, ReviewTag, CategoryRatings } from '@/lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  guide: 'ไกด์',
  food: 'อาหาร',
  hotel: 'ที่พัก',
  value: 'ความคุ้มค่า',
  program_accuracy: 'โปรแกรมตรงปก',
  would_return: 'อยากกลับไปอีก',
};

const CATEGORY_ICONS: Record<string, string> = {
  guide: '👨‍✈️',
  food: '🍜',
  hotel: '🏨',
  value: '💰',
  program_accuracy: '✅',
  would_return: '🔁',
};

function InteractiveStars({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface ReviewFormProps {
  tourSlug: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ tourSlug, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [availableTags, setAvailableTags] = useState<ReviewTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await reviewApi.getTags();
        if (res.success && res.data) {
          setAvailableTags(res.data);
        }
      } catch {
        // Ignore
      }
    };
    loadTags();
  }, []);

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  };

  const setCategoryRating = (category: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('กรุณาให้คะแนนรีวิว');
      return;
    }
    if (!comment.trim()) {
      setError('กรุณาเขียนความคิดเห็น');
      return;
    }
    if (comment.length > 200) {
      setError('ความคิดเห็นไม่เกิน 200 ตัวอักษร');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await reviewApi.submitReview(tourSlug, {
        rating,
        category_ratings: Object.keys(categoryRatings).length > 0 ? categoryRatings : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        comment: comment.trim(),
      });

      if (res.success) {
        setSuccess(true);
        onSuccess();
      } else {
        setError(res.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'เกิดข้อผิดพลาดในการส่งรีวิว');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">ขอบคุณสำหรับรีวิว!</h3>
        <p className="text-sm text-gray-500">รีวิวของคุณจะแสดงผลหลังจากตรวจสอบ</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overall Rating */}
      <div className="text-center">
        <h3 className="text-base font-semibold text-gray-900 mb-2">ให้คะแนนทัวร์นี้</h3>
        <InteractiveStars value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {rating === 5 ? 'ดีเยี่ยม!' : rating === 4 ? 'ดีมาก' : rating === 3 ? 'ปานกลาง' : rating === 2 ? 'ต้องปรับปรุง' : 'แย่มาก'}
          </p>
        )}
      </div>

      {/* Category Ratings */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">คะแนนรายหมวด (ไม่บังคับ)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5"
            >
              <span className="text-sm text-gray-600">
                {CATEGORY_ICONS[key]} {label}
              </span>
              <InteractiveStars
                value={categoryRatings[key as keyof CategoryRatings] || 0}
                onChange={(v) => setCategoryRating(key, v)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">แท็ก (เลือกได้หลายข้อ)</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.slug}
                type="button"
                onClick={() => toggleTag(tag.slug)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                  selectedTags.includes(tag.slug)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {tag.icon && <span className="mr-1">{tag.icon}</span>}
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">ความคิดเห็น *</h4>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="เล่าประสบการณ์ของคุณ..."
          rows={3}
          maxLength={200}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${comment.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
            {comment.length}/200
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="flex-1 py-2.5 px-4 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          ส่งรีวิว
        </button>
      </div>
    </div>
  );
}
