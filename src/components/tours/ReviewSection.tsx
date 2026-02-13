'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquarePlus, Star } from 'lucide-react';
import { reviewApi, TourReview, ReviewSummary } from '@/lib/api';
import TourReviewsDisplay from './TourReviews';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewSectionProps {
  tourSlug: string;
}

export default function ReviewSection({ tourSlug }: ReviewSectionProps) {
  const { member } = useAuth();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [activeSort, setActiveSort] = useState('latest');
  const [activeRating, setActiveRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async (page = 1, sort = 'latest', rating: number | null = null) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, sort };
      if (rating) params.rating = rating;

      const res = await reviewApi.getReviews(tourSlug, params);
      if (res.success && res.data) {
        setSummary(res.data.summary);
        setReviews(res.data.reviews.data);
        setTotalReviews(res.data.reviews.total);
        setCurrentPage(res.data.reviews.current_page);
        setLastPage(res.data.reviews.last_page);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [tourSlug]);

  // Check if member can review
  useEffect(() => {
    if (member) {
      reviewApi.canReview(tourSlug).then((res) => {
        if (res.success && res.data) {
          setCanReview(res.data.can_review);
        }
      }).catch(() => {});
    }
  }, [member, tourSlug]);

  useEffect(() => {
    fetchReviews(currentPage, activeSort, activeRating);
  }, [fetchReviews, currentPage, activeSort, activeRating]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.getElementById('reviews-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    setCurrentPage(1);
  };

  const handleRatingFilter = (rating: number | null) => {
    setActiveRating(rating);
    setCurrentPage(1);
  };

  const handleHelpful = async (reviewId: number) => {
    try {
      await reviewApi.markHelpful(reviewId);
      // Update locally
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        )
      );
    } catch {
      // Ignore
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setCanReview(false);
    // Refresh reviews
    fetchReviews(1, activeSort, activeRating);
  };

  return (
    <div id="reviews-section" className="scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">รีวิวจากลูกค้า</h2>
          {summary && summary.total_reviews > 0 && (
            <span className="text-sm text-gray-500">
              ({summary.average_rating} / 5)
            </span>
          )}
        </div>
        {member && canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            เขียนรีวิว
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">เขียนรีวิวของคุณ</h3>
          <ReviewForm
            tourSlug={tourSlug}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && !summary ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">กำลังโหลดรีวิว...</p>
        </div>
      ) : summary ? (
        <TourReviewsDisplay
          tourSlug={tourSlug}
          summary={summary}
          reviews={reviews}
          totalReviews={totalReviews}
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onRatingFilter={handleRatingFilter}
          onHelpful={handleHelpful}
          activeSort={activeSort}
          activeRating={activeRating}
        />
      ) : null}

      {/* Login prompt for non-members */}
      {!member && (
        <div className="mt-6 text-center bg-gray-50 rounded-xl py-6 px-4">
          <p className="text-sm text-gray-600 mb-2">เข้าสู่ระบบเพื่อเขียนรีวิว</p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            เข้าสู่ระบบ →
          </a>
        </div>
      )}
    </div>
  );
}
