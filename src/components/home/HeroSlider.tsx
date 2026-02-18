"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/config";

// Lazy load SearchForm - it pulls in api.ts (1500+ lines)
const SearchForm = dynamic(() => import("@/components/shared/SearchForm"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-2xl p-4 lg:p-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-12 bg-gray-200 rounded-lg" />
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-12 bg-gray-200 rounded-lg" />
        </div>
        <div className="flex items-end">
          <div className="h-12 bg-orange-300 rounded-lg w-full" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    </div>
  ),
});

interface HeroSlide {
  id: number;
  url: string;
  alt: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  sort_order: number;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${API_URL}/hero-slides/public`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setSlides(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero slides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Fallback gradient background if no slides
  const hasSlides = slides.length > 0;

  return (
    <section className="relative z-0 min-h-[100px] lg:min-h-[600px] text-white">
      {/* Background - Slides or Gradient */}
      {hasSlides ? (
        <>
          {/* Image Slides - only render first 2 slides initially for faster LCP */}
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 overflow-hidden ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={index !== currentSlide}
            >
              
              <Image
                src={slide.url}
                alt={slide.alt || "Hero image"}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                className="object-cover object-top"
                sizes="100vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>
          ))}

          {/* Slide Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[5] p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[5] p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[5] flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Skeleton Loading */
        <div className="absolute inset-0 bg-orange-700 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-orange-200 to-orange-300" />
          {/* Skeleton overlay for text area */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/50 via-transparent to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="container-custom relative z-10 py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* Dynamic title from current slide or default */}
          {isLoading ? (
            /* Skeleton for Title */
            <div className="animate-pulse">
              <div className="h-12 lg:h-16 bg-white/30 rounded-lg w-3/4 mb-4" />
              <div className="h-12 lg:h-16 bg-white/30 rounded-lg w-1/2 mb-6" />
              <div className="h-6 bg-white/20 rounded w-full max-w-md mb-2" />
              <div className="h-6 bg-white/20 rounded w-3/4 max-w-md mb-8" />
            </div>
          ) : hasSlides && slides[currentSlide]?.title ? (
            <>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
                {slides[currentSlide].title}
              </h1>
              {slides[currentSlide].subtitle && (
                <p className="text-xl lg:text-2xl text-white/90 mb-6 drop-shadow-md">
                  {slides[currentSlide].subtitle}
                </p>
              )}
              {slides[currentSlide].button_text && slides[currentSlide].button_link && (
                <Link
                  href={slides[currentSlide].button_link!}
                  className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors mb-8"
                >
                  {slides[currentSlide].button_text}
                </Link>
              )}
            </>
          ) : (
            <>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                ค้นหาทริปในฝัน
                <br />
                <span className="text-[var(--color-secondary-100)]">ท่องเที่ยวทั่วโลก</span>
              </h1>
              <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-xl drop-shadow-md">
                มากกว่า 500 ทัวร์จากบริษัทชั้นนำ พร้อมราคาพิเศษและทีมงานดูแลตลอดการเดินทาง
              </p>
            </>
          )}
        </div>

        {/* Search Box */}
        {isLoading ? (
          /* Skeleton for Search Box - must match real SearchForm dimensions to avoid CLS */
          <div className="bg-white rounded-2xl shadow-2xl p-4 lg:p-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-12 bg-gray-200 rounded-lg" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-12 bg-gray-200 rounded-lg" />
              </div>
              <div className="flex items-end">
                <div className="h-12 bg-gray-300 rounded-lg w-full" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-4 lg:p-6 max-w-5xl">
            <SearchForm variant="hero" showQuickLinks />
          </div>
        )}
      </div>
    </section>
  );
}
