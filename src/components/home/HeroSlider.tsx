"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, MapPin, Calendar, X, ChevronDown } from "lucide-react";
import { API_URL } from "@/lib/config";

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

interface CountryOption {
  id: number;
  name_th: string;
  slug: string;
  iso2: string;
  tour_count: number;
}

export default function HeroSlider() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<CountryOption[]>([]);

  // Country searchable dropdown state
  const [countrySearchText, setCountrySearchText] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Date range picker state
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDateLabel, setSelectedDateLabel] = useState("");
  const [departureDateFrom, setDepartureDateFrom] = useState("");
  const [departureDateTo, setDepartureDateTo] = useState("");
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const dateDropdownRef = useRef<HTMLDivElement>(null);

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

  // Fetch countries for search dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/tours/international?per_page=1`);
        const data = await response.json();
        if (data.success && data.filters?.countries) {
          setCountries(data.filters.countries);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setShowDateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered countries based on search text
  const filteredCountries = countries.filter(c =>
    c.name_th.toLowerCase().includes(countrySearchText.toLowerCase()) ||
    c.iso2.toLowerCase().includes(countrySearchText.toLowerCase())
  );

  const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Format date for display in Thai format DD/MM/YYYY (Buddhist year)
  const formatDateThai = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${Number(y) + 543}`;
  };

  // Date presets for travel date selection
  const datePresets = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return [
      {
        id: '7_days',
        label: '7 วันข้างหน้า',
        from: formatDate(today),
        to: formatDate(new Date(today.getTime() + 6 * 86400000)),
      },
      {
        id: '30_days',
        label: '30 วันข้างหน้า',
        from: formatDate(today),
        to: formatDate(new Date(today.getTime() + 29 * 86400000)),
      },
      {
        id: 'this_month',
        label: `เดือนนี้ (${thMonths[now.getMonth()]} ${now.getFullYear() + 543})`,
        from: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      },
      {
        id: 'next_month',
        label: (() => {
          const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return `เดือนหน้า (${thMonths[next.getMonth()]} ${next.getFullYear() + 543})`;
        })(),
        from: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1)),
        to: formatDate(new Date(now.getFullYear(), now.getMonth() + 2, 0)),
      },
    ];
  })();

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    setCountrySearchText(country.name_th);
    setShowCountryDropdown(false);
  };

  const handleClearCountry = () => {
    setSelectedCountry(null);
    setCountrySearchText("");
  };

  const handleSelectDatePreset = (preset: typeof datePresets[0]) => {
    setDepartureDateFrom(preset.from);
    setDepartureDateTo(preset.to);
    setSelectedDateLabel(preset.label);
    setShowDateDropdown(false);
    setShowCustomDates(false);
  };

  const handleApplyCustomDates = () => {
    if (customDateFrom && customDateTo) {
      setDepartureDateFrom(customDateFrom);
      setDepartureDateTo(customDateTo);
      setSelectedDateLabel(`${formatDateThai(customDateFrom)} - ${formatDateThai(customDateTo)}`);
      setShowDateDropdown(false);
      setShowCustomDates(false);
    } else if (customDateFrom) {
      setDepartureDateFrom(customDateFrom);
      setDepartureDateTo("");
      setSelectedDateLabel(`ตั้งแต่ ${formatDateThai(customDateFrom)}`);
      setShowDateDropdown(false);
      setShowCustomDates(false);
    }
  };

  const handleClearDate = () => {
    setDepartureDateFrom("");
    setDepartureDateTo("");
    setSelectedDateLabel("");
    setShowCustomDates(false);
    setCustomDateFrom("");
    setCustomDateTo("");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (departureDateFrom) params.set('departure_date_from', departureDateFrom);
    if (departureDateTo) params.set('departure_date_to', departureDateTo);
    const qs = params.toString();

    if (selectedCountry) {
      router.push(`/tours/country/${selectedCountry.slug}${qs ? `?${qs}` : ''}`);
    } else {
      router.push(`/tours/international${qs ? `?${qs}` : ''}`);
    }
  };

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
    <section className="relative min-h-100px] lg:min-h-[600px] text-white">
      {/* Background - Slides or Gradient */}
      {hasSlides ? (
        <>
          {/* Image Slides */}
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 overflow-hidden ${
                index === currentSlide ? "opacity-100" : "opacity-1"
              }`}
            >
              
              <Image
                src={slide.url}
                alt={slide.alt || "Hero image"}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "low"}
                className="object-cover object-top"
            
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
          /* Skeleton for Search Box */
          <div className="bg-white/80 rounded-2xl shadow-2xl p-4 lg:p-6 max-w-4xl animate-pulse">
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
          <div className="bg-white rounded-2xl shadow-2xl p-4 lg:p-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Country Searchable Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1.5">
                  เลือกประเทศปลายทาง
                </label>
                <div className="relative" ref={countryDropdownRef}>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)] z-10" />
                  <input
                    type="text"
                    value={countrySearchText}
                    onChange={(e) => {
                      setCountrySearchText(e.target.value);
                      setSelectedCountry(null);
                      setShowCountryDropdown(true);
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="พิมพ์ชื่อประเทศเพื่อค้นหา..."
                    className="w-full pl-10 pr-16 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-100)] text-[var(--color-gray-800)] bg-white transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {countrySearchText && (
                      <button onClick={handleClearCountry} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                      <ChevronDown className={`w-4 h-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div
                        className={`px-4 py-2.5 cursor-pointer transition-colors text-sm ${!selectedCountry ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-[var(--color-gray-600)] hover:bg-blue-50'}`}
                        onClick={() => { setSelectedCountry(null); setCountrySearchText(""); setShowCountryDropdown(false); }}
                      >
                        ทุกประเทศ
                      </div>
                      {filteredCountries.map((c) => (
                        <div
                          key={c.id}
                          className={`px-4 py-2.5 cursor-pointer transition-colors text-sm flex items-center justify-between ${selectedCountry?.id === c.id ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-[var(--color-gray-800)] hover:bg-blue-50'}`}
                          onClick={() => handleSelectCountry(c)}
                        >
                          <span className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/w20/${c.iso2.toLowerCase()}.png`} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                            {c.name_th}
                          </span>
                          <span className={`text-xs ${selectedCountry?.id === c.id ? 'text-blue-100' : 'text-gray-400'}`}>({c.tour_count})</span>
                        </div>
                      ))}
                      {filteredCountries.length === 0 && countrySearchText && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">ไม่พบประเทศที่ค้นหา</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Range Preset Picker */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1.5">
                  เลือกช่วงวันที่เดินทาง
                </label>
                <div className="relative" ref={dateDropdownRef}>
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)] z-10" />
                  <div
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="w-full pl-10 pr-16 py-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer text-sm min-h-[48px] flex items-center bg-white transition-colors"
                  >
                    <span className={selectedDateLabel ? 'text-[var(--color-gray-800)]' : 'text-gray-400'}>
                      {selectedDateLabel || 'เลือกช่วงวันที่'}
                    </span>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {selectedDateLabel && (
                      <button onClick={(e) => { e.stopPropagation(); handleClearDate(); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setShowDateDropdown(!showDateDropdown)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showDateDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px]">
                      {/* Quick presets */}
                      {datePresets.map((preset) => (
                        <div
                          key={preset.id}
                          className={`px-4 py-2.5 cursor-pointer transition-colors text-sm ${departureDateFrom === preset.from && departureDateTo === preset.to ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-[var(--color-gray-800)] hover:bg-blue-50'}`}
                          onClick={() => handleSelectDatePreset(preset)}
                        >
                          {preset.label}
                        </div>
                      ))}
                      {/* Custom date range */}
                      <div className="border-t border-gray-100">
                        <div
                          className={`px-4 py-2.5 cursor-pointer transition-colors text-sm font-medium flex items-center justify-between ${showCustomDates ? 'text-blue-600 bg-blue-50' : 'text-[var(--color-gray-800)] hover:bg-blue-50'}`}
                          onClick={() => setShowCustomDates(!showCustomDates)}
                        >
                          <span>กำหนดเอง</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showCustomDates ? 'rotate-180' : ''}`} />
                        </div>
                        {showCustomDates && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่มต้น</label>
                              <input
                                type="date"
                                value={customDateFrom}
                                onChange={(e) => setCustomDateFrom(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-800 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">วันที่สิ้นสุด</label>
                              <input
                                type="date"
                                value={customDateTo}
                                min={customDateFrom || undefined}
                                onChange={(e) => setCustomDateTo(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-800 bg-white"
                              />
                            </div>
                            {customDateFrom && customDateTo && (
                              <div className="text-xs text-gray-500 text-center">
                                {formatDateThai(customDateFrom)} - {formatDateThai(customDateTo)}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => { handleClearDate(); }}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                ล้าง
                              </button>
                              <button
                                onClick={handleApplyCustomDates}
                                disabled={!customDateFrom}
                                className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                เลือก
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span>ค้นหาทัวร์</span>
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <span className="text-sm text-[var(--color-gray-500)]">ยอดนิยม:</span>
              {countries.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/tours/country/${c.slug}`}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
                >
                  {c.name_th}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
