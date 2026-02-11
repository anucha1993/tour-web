"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/config";

interface OurClient {
  id: number;
  url: string;
  thumbnail_url: string | null;
  filename: string;
  name: string;
  alt: string | null;
  description: string | null;
  website_url: string | null;
  width: number;
  height: number;
  is_active: boolean;
  sort_order: number;
}

// Skeleton placeholder
function SkeletonLogo() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px]">
      <div className="flex items-center justify-center p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="relative w-[120px] h-[80px] bg-gray-200 rounded-lg animate-pulse overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>
    </div>
  );
}

// Single client card
function ClientCard({ client }: { client: OurClient }) {
  const imageEl = (
    <div className="flex items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm group">
      <div className="relative w-[120px] h-[80px]">
        <Image
          src={client.url}
          alt={client.alt || client.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="120px"
          unoptimized
        />
      </div>
      {client.name && <span className="sr-only">{client.name}</span>}
    </div>
  );

  if (client.website_url) {
    return (
      <a
        href={client.website_url}
        target="_blank"
        rel="noopener noreferrer"
        title={client.name}
        className="flex-shrink-0 w-[160px] sm:w-[180px]"
      >
        {imageEl}
      </a>
    );
  }

  return (
    <div title={client.name} className="flex-shrink-0 w-[160px] sm:w-[180px]">
      {imageEl}
    </div>
  );
}

export default function OurClients() {
  const [clients, setClients] = useState<OurClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef(0.8); // px per frame

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}/our-clients/public`);
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setClients(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch our clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Infinite auto-scroll animation
  const animate = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    container.scrollLeft += scrollSpeedRef.current;

    // When scrolled past the first set, jump back seamlessly
    const halfScroll = container.scrollWidth / 2;
    if (container.scrollLeft >= halfScroll) {
      container.scrollLeft -= halfScroll;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    if (clients.length === 0) return;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [clients, animate]);

  // Manual scroll by clicking arrows
  const scrollBy = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === "left" ? -300 : 300;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Don't render section if no clients
  if (!isLoading && clients.length === 0) {
    return null;
  }

  // Duplicate clients for seamless infinite loop
  const loopClients = clients.length > 0 ? [...clients, ...clients] : [];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)] flex items-center justify-center gap-2">
            <Users className="w-7 h-7 text-[var(--color-primary)]" />
            ลูกค้าของเรา
          </h2>
          <p className="text-[var(--color-gray-500)] mt-2">
            องค์กรและบริษัทชั้นนำที่ไว้วางใจใช้บริการ
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="relative">
            <div className="flex gap-4 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <SkeletonLogo key={i} />
              ))}
            </div>
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
          </div>
        )}

        {/* Infinite Carousel */}
        {!isLoading && clients.length > 0 && (
          <div className="relative group/carousel">
            {/* Left Arrow */}
            <button
              onClick={() => scrollBy("left")}
              className="absolute -left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="เลื่อนซ้าย"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollBy("right")}
              className="absolute -right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="เลื่อนขวา"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* Scrolling Track */}
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="flex gap-4 overflow-x-hidden scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {loopClients.map((client, index) => (
                <ClientCard key={`${client.id}-${index}`} client={client} />
              ))}
            </div>

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
