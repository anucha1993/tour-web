"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { API_URL } from "@/lib/config";

interface Promotion {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  type: string;
  discount_value: string | null;
  banner_url: string;
  link_url: string | null;
  start_date: string | null;
  end_date: string | null;
  badge_text: string | null;
  badge_color: string | null;
}

// Badge color mapping
const BADGE_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

// Skeleton Card - matches 396x191 aspect ratio (approximately 2.07:1)
function SkeletonCard() {
  return (
    <div className="w-[300px] md:w-[396px] flex-shrink-0">
      <div className="relative aspect-[396/191] rounded-xl overflow-hidden bg-gray-200 animate-pulse" />
    </div>
  );
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(`${API_URL}/promotions/public?limit=10`);
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setPromotions(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // Calculate max steps
  const maxSteps = Math.max(0, promotions.length - itemsPerView);

  // Auto-play carousel - step by step
  useEffect(() => {
    if (promotions.length <= itemsPerView) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev >= maxSteps ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [promotions.length, itemsPerView, maxSteps]);

  const prevSlide = useCallback(() => {
    setCurrentStep((prev) => (prev <= 0 ? maxSteps : prev - 1));
  }, [maxSteps]);

  const nextSlide = useCallback(() => {
    setCurrentStep((prev) => (prev >= maxSteps ? 0 : prev + 1));
  }, [maxSteps]);

  // Don't render if no promotions
  if (!isLoading && promotions.length === 0) {
    return null;
  }

  // Calculate card width percentage based on items per view
  const cardWidthPercent = 100 / itemsPerView;
  const gapPx = 16; // gap-4 = 16px

  return (
    <section className="py-12 lg:py-16 bg-[var(--color-gray-50)]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-left mb-8  border-[var(--color-primary)] pl-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)] flex items-center gap-2">
            <Tag className="w-7 h-7 text-[var(--color-primary)]" />
            โปรโมชั่นพิเศษ
          </h2>
          <p className="text-[var(--color-gray-500)] mt-2">
            ข้อเสนอสุดพิเศษที่คัดสรรมาเพื่อคุณ
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Carousel */}
        {!isLoading && promotions.length > 0 && (
          <div className="relative">
            {/* Navigation Arrows */}
            {promotions.length > itemsPerView && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg transition-all z-10 border border-gray-100"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg transition-all z-10 border border-gray-100"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden" ref={containerRef}>
              <div 
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{ 
                  transform: `translateX(calc(-${currentStep * cardWidthPercent}% - ${currentStep * gapPx}px))` 
                }}
              >
                {promotions.map((promotion) => (
                  <div 
                    key={promotion.id} 
                    className="flex-shrink-0"
                    style={{ width: `calc(${cardWidthPercent}% - ${gapPx * (itemsPerView - 1) / itemsPerView}px)` }}
                  >
                    <Link
                      href={promotion.link_url || `/promotions`}
                      className="block relative aspect-[396/191] rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow"
                    >
                      {/* Banner Image - 396x191 aspect ratio */}
                      <Image
                        src={promotion.banner_url}
                        alt={promotion.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={90}
                        unoptimized
                      />

                      {/* Badge */}
                      {promotion.badge_text && (
                        <div className={`absolute top-2 right-2 ${BADGE_COLORS[promotion.badge_color || 'orange'] || 'bg-orange-500'} text-white text-xs font-bold px-2 py-1 rounded-full shadow`}>
                          {promotion.badge_text}
                        </div>
                      )}

                      {/* Hover Overlay with Name */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                        <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-semibold text-sm line-clamp-1 drop-shadow-lg">
                            {promotion.name}
                          </h3>
                          {promotion.code && (
                            <span className="text-white/80 text-xs">รหัส: {promotion.code}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            {promotions.length > itemsPerView && (
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(maxSteps + 1)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-[var(--color-primary)] w-5'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
