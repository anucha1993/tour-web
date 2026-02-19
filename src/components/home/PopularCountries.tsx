"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/lib/config";

interface PopularCountry {
  id: number;
  iso2: string;
  iso3: string;
  name_en: string;
  name_th: string | null;
  slug: string;
  region: string | null;
  flag_emoji: string | null;
  tour_count: number;
  display_name: string;
  image_url: string | null;
  alt_text: string | null;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
}

interface PopularCountriesProps {
  slug?: string; // Setting slug to use, defaults to "homepage"
}

// Skeleton Card Component
function SkeletonCard() {
  return (
    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 animate-pulse">
      {/* Tour count badge skeleton */}
      <div className="absolute top-3 right-3 w-16 h-6 bg-gray-300 rounded-full" />
      
      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function PopularCountries({ slug = "homepage" }: PopularCountriesProps) {
  const [countries, setCountries] = useState<PopularCountry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/popular-countries/public?slug=${slug}`);
        const data = await response.json();
        
        if (data.success && data.data?.countries) {
          setCountries(data.data.countries);
        }
      } catch (err) {
        console.error("Failed to fetch popular countries:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [slug]);

  // Don't show section if no countries and not loading
  if (!isLoading && countries.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-left mb-10 border-l-4 border-[var(--color-primary)] pl-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)]">
           ประเทศยอดนิยม 
          </h2>
          <p className="text-[var(--color-gray-500)] mt-2">
            เลือกดูทัวร์ตามประเทศที่คุณสนใจ จุดหมายปลายทางยอดนิยม
          </p>
        </div>

        {/* Skeleton Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-[var(--color-gray-500)]">
            {error}
          </div>
        )}

        {/* Countries Grid */}
        {!isLoading && !error && countries.length > 0 && (
          <div className={`grid gap-4 ${
            countries.length <= 3 
              ? 'grid-cols-1 md:grid-cols-4' 
              : countries.length === 4 
                ? 'grid-cols-2 md:grid-cols-4' 
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
          }`}>
            {countries.map((country) => (
              <Link
                key={country.id}
                href={country.link_url || `/tours?country=${country.iso2.toLowerCase()}`}
                className="group relative aspect-[3/3] rounded-xl overflow-hidden bg-[var(--color-gray-200)]"
              >
                {/* Background Image */}
                {country.image_url ? (
                  <Image
                    src={country.image_url}
                    alt={country.alt_text || country.display_name || country.name_th || country.name_en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    quality={90}
                    unoptimized
                  />
                ) : (
                  // Placeholder with gradient and flag
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-6xl">{country.flag_emoji || '🌍'}</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                
                {/* Tour count badge */}
                <div className="absolute top-3 right-3 z-20 bg-orange-500 text-[var(--color-white)] text-xs font-bold px-2 py-1 rounded-full">
                  {country.tour_count} โปรแกรมทัวร์
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                  {/* ISO Code + Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">
                      {country.iso2}
                    </span>
                    <h3 className="text-lg font-bold leading-tight">
                      {country.title || country.display_name || country.name_th || country.name_en}
                    </h3>
                  </div>
                  
                  {/* Subtitle / Description */}
                  {country.subtitle ? (
                    <p className="text-sm text-white/90 mt-1 line-clamp-2">
                      {country.subtitle}
                    </p>
                  ) : (
                    <p className="text-sm text-white/80 mt-1">
                      {country.name_en}
                    </p>
                  )}
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/20 transition-colors z-10" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
