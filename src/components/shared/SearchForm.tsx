"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Calendar, X, ChevronDown, Clock, TrendingUp, Banknote, SlidersHorizontal } from "lucide-react";
import { API_URL } from "@/lib/config";
import { searchApi } from "@/lib/api";

interface CountryOption {
  id: number;
  name_th: string;
  slug: string;
  iso2: string;
  tour_count: number;
}

interface SearchFormProps {
  /** Initial keyword value */
  initialKeyword?: string;
  /** Visual variant */
  variant?: "hero" | "page";
  /** Called after navigation (optional) */
  onSearch?: () => void;
  /** Show quick links row */
  showQuickLinks?: boolean;
}

export default function SearchForm({ initialKeyword = "", variant = "page", onSearch, showQuickLinks = false }: SearchFormProps) {
  const router = useRouter();

  // Countries
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countrySearchText, setCountrySearchText] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Keyword
  const [keyword, setKeyword] = useState(initialKeyword);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedAutoIndex, setSelectedAutoIndex] = useState(-1);
  const keywordRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advanced filter toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Price
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedPriceLabel, setSelectedPriceLabel] = useState("");
  const [customPriceMin, setCustomPriceMin] = useState("");
  const [customPriceMax, setCustomPriceMax] = useState("");
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  // Date
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDateLabel, setSelectedDateLabel] = useState("");
  const [departureDateFrom, setDepartureDateFrom] = useState("");
  const [departureDateTo, setDepartureDateTo] = useState("");
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Sync keyword when initialKeyword changes
  useEffect(() => { setKeyword(initialKeyword); }, [initialKeyword]);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/tours/international?per_page=1`);
        const data = await response.json();
        if (data.success && data.filters?.countries) {
          setCountries(data.filters.countries);
        }
      } catch { /* ignore */ }
    };
    fetchCountries();
  }, []);

  // Load recent searches + popular suggestions
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
    searchApi.suggestions().then(res => {
      if (res.data) setSuggestions(res.data);
    }).catch(() => {});
  }, []);

  // Debounced keyword suggestions
  useEffect(() => {
    if (!keyword.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.suggestions(keyword.trim());
        if (res.data) { setSuggestions(res.data); setSelectedAutoIndex(-1); }
      } catch { /* ignore */ }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [keyword]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) setShowCountryDropdown(false);
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) setShowDateDropdown(false);
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(e.target as Node)) setShowPriceDropdown(false);
      if (keywordRef.current && !keywordRef.current.contains(e.target as Node)) setShowAutocomplete(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered countries
  const filteredCountries = countries.filter(c =>
    c.name_th.toLowerCase().includes(countrySearchText.toLowerCase()) ||
    c.iso2.toLowerCase().includes(countrySearchText.toLowerCase())
  );

  // Date helpers
  const thMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fmtDateThai = (ds: string) => { if (!ds) return ""; const [y, m, d] = ds.split("-"); return `${d}/${m}/${Number(y) + 543}`; };

  const datePresets = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return [
      { id: "7d", label: "7 วันข้างหน้า", from: fmtDate(today), to: fmtDate(new Date(today.getTime() + 6 * 86400000)) },
      { id: "30d", label: "30 วันข้างหน้า", from: fmtDate(today), to: fmtDate(new Date(today.getTime() + 29 * 86400000)) },
      { id: "this", label: `เดือนนี้ (${thMonths[now.getMonth()]} ${now.getFullYear() + 543})`, from: fmtDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmtDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)) },
      { id: "next", label: (() => { const n = new Date(now.getFullYear(), now.getMonth() + 1, 1); return `เดือนหน้า (${thMonths[n.getMonth()]} ${n.getFullYear() + 543})`; })(), from: fmtDate(new Date(now.getFullYear(), now.getMonth() + 1, 1)), to: fmtDate(new Date(now.getFullYear(), now.getMonth() + 2, 0)) },
    ];
  })();

  // Handlers
  const handleSelectCountry = (c: CountryOption) => { setSelectedCountry(c); setCountrySearchText(c.name_th); setShowCountryDropdown(false); };
  const handleClearCountry = () => { setSelectedCountry(null); setCountrySearchText(""); };
  const handleSelectDatePreset = (p: typeof datePresets[0]) => { setDepartureDateFrom(p.from); setDepartureDateTo(p.to); setSelectedDateLabel(p.label); setShowDateDropdown(false); setShowCustomDates(false); };
  const handleClearDate = () => { setDepartureDateFrom(""); setDepartureDateTo(""); setSelectedDateLabel(""); setShowCustomDates(false); setCustomDateFrom(""); setCustomDateTo(""); };
  const pricePresets = [
    { label: 'ต่ำกว่า 10,000 บาท',     min: '',      max: '10000' },
    { label: '10,000 – 20,000 บาท',   min: '10000', max: '20000' },
    { label: '20,000 – 30,000 บาท',   min: '20000', max: '30000' },
    { label: '30,000 – 50,000 บาท',   min: '30000', max: '50000' },
    { label: 'มากกว่า 50,000 บาท',    min: '50000', max: '' },
  ];
  const handleSelectPricePreset = (p: typeof pricePresets[0]) => { setPriceMin(p.min); setPriceMax(p.max); setSelectedPriceLabel(p.label); setShowPriceDropdown(false); setShowCustomPrice(false); };
  const handleClearPrice = () => { setPriceMin(''); setPriceMax(''); setSelectedPriceLabel(''); setCustomPriceMin(''); setCustomPriceMax(''); setShowCustomPrice(false); };
  const handleApplyCustomPrice = () => {
    if (customPriceMin || customPriceMax) {
      setPriceMin(customPriceMin); setPriceMax(customPriceMax);
      const minFmt = customPriceMin ? `฿${Number(customPriceMin).toLocaleString()}` : '';
      const maxFmt = customPriceMax ? `฿${Number(customPriceMax).toLocaleString()}` : '';
      setSelectedPriceLabel(minFmt && maxFmt ? `${minFmt} – ${maxFmt}` : minFmt ? `มากกว่า ${minFmt}` : `ต่ำกว่า ${maxFmt}`);
      setShowPriceDropdown(false); setShowCustomPrice(false);
    }
  };

  const handleApplyCustomDates = () => {
    if (customDateFrom && customDateTo) { setDepartureDateFrom(customDateFrom); setDepartureDateTo(customDateTo); setSelectedDateLabel(`${fmtDateThai(customDateFrom)} - ${fmtDateThai(customDateTo)}`); setShowDateDropdown(false); setShowCustomDates(false); }
    else if (customDateFrom) { setDepartureDateFrom(customDateFrom); setDepartureDateTo(""); setSelectedDateLabel(`ตั้งแต่ ${fmtDateThai(customDateFrom)}`); setShowDateDropdown(false); setShowCustomDates(false); }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => regex.test(part) ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part);
  };

  const saveRecentSearch = (kw: string) => {
    const t = kw.trim();
    if (!t || t.length < 2) return;
    const updated = [t, ...recentSearches.filter(s => s !== t)].slice(0, 8);
    setRecentSearches(updated);
    try { localStorage.setItem("recent_searches", JSON.stringify(updated)); } catch { /* ignore */ }
    searchApi.trackKeyword(t).catch(() => {});
  };

  const removeRecentSearch = (kw: string) => {
    const updated = recentSearches.filter(s => s !== kw);
    setRecentSearches(updated);
    try { localStorage.setItem("recent_searches", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem("recent_searches"); } catch { /* ignore */ }
  };

  const handleSearch = useCallback(() => {
    setShowAutocomplete(false);
    if (keyword.trim()) saveRecentSearch(keyword.trim());
    const params = new URLSearchParams();
    if (departureDateFrom) params.set("departure_date_from", departureDateFrom);
    if (departureDateTo) params.set("departure_date_to", departureDateTo);
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    if (keyword.trim()) params.set("search", keyword.trim());
    const qs = params.toString();

    if (selectedCountry) {
      router.push(`/tours/country/${selectedCountry.slug}${qs ? `?${qs}` : ""}`);
    } else if (keyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}${departureDateFrom ? `&departure_date_from=${departureDateFrom}` : ""}${departureDateTo ? `&departure_date_to=${departureDateTo}` : ""}${priceMin ? `&price_min=${priceMin}` : ""}${priceMax ? `&price_max=${priceMax}` : ""}`);
    } else {
      router.push(`/tours/international${qs ? `?${qs}` : ""}`);
    }
    onSearch?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, departureDateFrom, departureDateTo, priceMin, priceMax, selectedCountry, router, onSearch]);

  const searchWithKeyword = (kw: string) => {
    setKeyword(kw);
    setShowAutocomplete(false);
    saveRecentSearch(kw);
    const params = new URLSearchParams();
    if (departureDateFrom) params.set("departure_date_from", departureDateFrom);
    if (departureDateTo) params.set("departure_date_to", departureDateTo);
    params.set("search", kw);
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    if (selectedCountry) {
      router.push(`/tours/country/${selectedCountry.slug}?${params.toString()}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(kw)}${departureDateFrom ? `&departure_date_from=${departureDateFrom}` : ""}${departureDateTo ? `&departure_date_to=${departureDateTo}` : ""}${priceMin ? `&price_min=${priceMin}` : ""}${priceMax ? `&price_max=${priceMax}` : ""}`);
    }
    onSearch?.();
  };

  const inputCls = variant === "hero"
    ? "w-full py-3 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-100)] text-[var(--color-gray-800)] bg-white transition-colors"
    : "w-full py-3 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 bg-white transition-colors";

  const labelCls = "block text-sm font-medium text-[var(--color-gray-700)] mb-1.5";
  const highlightCls = variant === "hero" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700";

  return (
    <div>
      {/* ── Row 1: Keyword + Country + Button ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="md:col-span-2">
          <label className={labelCls}>ค้นหาทัวร์</label>
          <div className="relative" ref={keywordRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)] z-10" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setShowAutocomplete(true); }}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={(e) => {
                const visibleItems = keyword.trim()
                  ? [...recentSearches.filter(s => s.includes(keyword.trim()) && s !== keyword.trim()), ...suggestions.filter(s => !recentSearches.includes(s))]
                  : [...recentSearches, ...suggestions.filter(s => !recentSearches.includes(s))];
                if (e.key === "ArrowDown") { e.preventDefault(); setSelectedAutoIndex(p => Math.min(p + 1, visibleItems.length - 1)); if (selectedAutoIndex + 1 < visibleItems.length) setKeyword(visibleItems[selectedAutoIndex + 1]); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedAutoIndex(p => Math.max(p - 1, -1)); if (selectedAutoIndex - 1 >= 0) setKeyword(visibleItems[selectedAutoIndex - 1]); }
                else if (e.key === "Enter") { e.preventDefault(); setShowAutocomplete(false); handleSearch(); }
                else if (e.key === "Escape") setShowAutocomplete(false);
              }}
              placeholder="ชื่อทัวร์ รหัสทัวร์ จุดหมาย..."
              className={`${inputCls} pl-10 pr-10`}
            />
            {keyword && (
              <button onClick={() => setKeyword("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showAutocomplete && (() => {
              const matchingRecent = keyword.trim() ? recentSearches.filter(s => s.includes(keyword.trim()) && s !== keyword.trim()) : recentSearches;
              const apiSuggestions = suggestions.filter(s => !recentSearches.includes(s));
              const hasContent = matchingRecent.length > 0 || apiSuggestions.length > 0;
              if (!hasContent && !keyword.trim()) return null;
              let itemIndex = 0;

              return (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {matchingRecent.length > 0 && (
                    <>
                      {!keyword.trim() && (
                        <div className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ค้นหาล่าสุด</span>
                          <button onClick={(e) => { e.stopPropagation(); clearAllRecent(); }} className="text-blue-500 hover:text-blue-700 cursor-pointer">ลบทั้งหมด</button>
                        </div>
                      )}
                      {matchingRecent.map((term) => {
                        const idx = itemIndex++;
                        return (
                          <div key={`recent-${term}`} className={`px-4 py-2.5 cursor-pointer transition-colors text-sm flex items-center gap-3 group ${idx === selectedAutoIndex ? highlightCls : "text-gray-700 hover:bg-gray-50"}`}
                            onClick={() => searchWithKeyword(term)} onMouseEnter={() => setSelectedAutoIndex(idx)}>
                            <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            <span className="flex-1 truncate">{keyword.trim() ? highlightMatch(term, keyword) : term}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeRecentSearch(term); }} className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0">ลบ</button>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {apiSuggestions.length > 0 && (
                    <>
                      {!keyword.trim() && (
                        <div className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border-b border-gray-100 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ยอดนิยม
                        </div>
                      )}
                      {apiSuggestions.map((term) => {
                        const idx = itemIndex++;
                        return (
                          <div key={`suggest-${term}`} className={`px-4 py-2.5 cursor-pointer transition-colors text-sm flex items-center gap-3 ${idx === selectedAutoIndex ? highlightCls : "text-gray-700 hover:bg-gray-50"}`}
                            onClick={() => searchWithKeyword(term)} onMouseEnter={() => setSelectedAutoIndex(idx)}>
                            <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            <span className="flex-1 truncate">{keyword.trim() ? highlightMatch(term, keyword) : term}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {keyword.trim() && matchingRecent.length === 0 && apiSuggestions.length === 0 && (
                    <div className="px-4 py-2.5 cursor-pointer text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => { setShowAutocomplete(false); handleSearch(); }}>
                      <Search className="w-4 h-4 text-gray-300" />
                      <span>ค้นหา &quot;{keyword}&quot;</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Country Dropdown */}
        <div>
          <label className={labelCls}>เลือกประเทศปลายทาง</label>
          <div className="relative" ref={countryDropdownRef}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)] z-10" />
            <input
              type="text"
              value={countrySearchText}
              onChange={(e) => { setCountrySearchText(e.target.value); setSelectedCountry(null); setShowCountryDropdown(true); }}
              onFocus={() => setShowCountryDropdown(true)}
              placeholder="พิมพ์ชื่อประเทศ..."
              className={`${inputCls} pl-10 pr-16`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {countrySearchText && (
                <button onClick={handleClearCountry} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                <ChevronDown className={`w-4 h-4 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showCountryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className={`px-4 py-2.5 cursor-pointer transition-colors text-sm ${!selectedCountry ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-600 hover:bg-blue-50"}`}
                  onClick={() => { setSelectedCountry(null); setCountrySearchText(""); setShowCountryDropdown(false); }}>
                  ทุกประเทศ
                </div>
                {filteredCountries.map((c) => (
                  <div key={c.id} className={`px-4 py-2.5 cursor-pointer transition-colors text-sm flex items-center justify-between ${selectedCountry?.id === c.id ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-800 hover:bg-blue-50"}`}
                    onClick={() => handleSelectCountry(c)}>
                    <span className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w20/${c.iso2.toLowerCase()}.png`} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                      {c.name_th}
                    </span>
                    <span className={`text-xs ${selectedCountry?.id === c.id ? "text-blue-100" : "text-gray-400"}`}>({c.tour_count})</span>
                  </div>
                ))}
                {filteredCountries.length === 0 && countrySearchText && (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">ไม่พบประเทศที่ค้นหา</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>ค้นหาทัวร์</span>
          </button>
          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
              showAdvanced || selectedDateLabel || selectedPriceLabel
                ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            title="ตัวกรองเพิ่มเติม"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {(selectedDateLabel || selectedPriceLabel) && (
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
            )}

          </button>
        </div>
      </div>

      {/* ── Row 2: Advanced filters (date + price) ── */}
      <div
        className={`transition-all duration-300 ${
          showAdvanced ? 'max-h-[500px] opacity-100 mt-3 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">

          {/* Date Picker */}
          <div>
            <label className={labelCls}>ช่วงวันที่เดินทาง</label>
            <div className="relative" ref={dateDropdownRef}>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)] z-10" />
              <div
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className={`${inputCls} pl-10 pr-16 cursor-pointer text-sm min-h-[48px] flex items-center`}
              >
                <span className={selectedDateLabel ? "text-gray-800" : "text-gray-400"}>
                  {selectedDateLabel || "เลือกช่วงวัน"}
                </span>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {selectedDateLabel && (
                  <button onClick={(e) => { e.stopPropagation(); handleClearDate(); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setShowDateDropdown(!showDateDropdown)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDateDropdown ? "rotate-180" : ""}`} />
                </button>
              </div>
              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px]">
                  {datePresets.map((preset) => (
                    <div key={preset.id} className={`px-4 py-2.5 cursor-pointer transition-colors text-sm ${departureDateFrom === preset.from && departureDateTo === preset.to ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-800 hover:bg-blue-50"}`}
                      onClick={() => handleSelectDatePreset(preset)}>
                      {preset.label}
                    </div>
                  ))}
                  <div className="border-t border-gray-100">
                    <div className={`px-4 py-2.5 cursor-pointer transition-colors text-sm font-medium flex items-center justify-between ${showCustomDates ? "text-blue-600 bg-blue-50" : "text-gray-800 hover:bg-blue-50"}`}
                      onClick={() => setShowCustomDates(!showCustomDates)}>
                      <span>กำหนดเอง</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showCustomDates ? "rotate-180" : ""}`} />
                    </div>
                    {showCustomDates && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่มต้น</label>
                          <input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-800 bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันที่สิ้นสุด</label>
                          <input type="date" value={customDateTo} min={customDateFrom || undefined} onChange={(e) => setCustomDateTo(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-800 bg-white" />
                        </div>
                        {customDateFrom && customDateTo && (
                          <div className="text-xs text-gray-500 text-center">{fmtDateThai(customDateFrom)} - {fmtDateThai(customDateTo)}</div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={handleClearDate} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">ล้าง</button>
                          <button onClick={handleApplyCustomDates} disabled={!customDateFrom}
                            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">เลือก</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className={labelCls}>ช่วงราคา</label>
            <div className="relative" ref={priceDropdownRef}>
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)] z-10" />
              <div
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className={`${inputCls} pl-10 pr-8 cursor-pointer text-sm min-h-[48px] flex items-center`}
              >
                <span className={selectedPriceLabel ? "text-gray-800" : "text-gray-400"}>
                  {selectedPriceLabel || "ทุกราคา"}
                </span>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {selectedPriceLabel && (
                  <button onClick={(e) => { e.stopPropagation(); handleClearPrice(); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setShowPriceDropdown(!showPriceDropdown)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer">
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPriceDropdown ? "rotate-180" : ""}`} />
                </button>
              </div>
              {showPriceDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[240px]">
                  {pricePresets.map((p) => (
                    <div
                      key={p.label}
                      className={`px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                        priceMin === p.min && priceMax === p.max && selectedPriceLabel
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-gray-800 hover:bg-blue-50'
                      }`}
                      onClick={() => handleSelectPricePreset(p)}
                    >
                      {p.label}
                    </div>
                  ))}
                  <div className="border-t border-gray-100">
                    <div
                      className={`px-4 py-2.5 cursor-pointer transition-colors text-sm font-medium flex items-center justify-between ${showCustomPrice ? 'text-blue-600 bg-blue-50' : 'text-gray-800 hover:bg-blue-50'}`}
                      onClick={() => setShowCustomPrice(!showCustomPrice)}
                    >
                      <span>กำหนดเอง</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showCustomPrice ? 'rotate-180' : ''}`} />
                    </div>
                    {showCustomPrice && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">ราคาต่ำสุด (฿)</label>
                            <input type="number" min="0" step="1000" placeholder="0"
                              value={customPriceMin} onChange={(e) => setCustomPriceMin(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-800 bg-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">ราคาสูงสุด (฿)</label>
                            <input type="number" min="0" step="1000" placeholder="ไม่จำกัด"
                              value={customPriceMax} onChange={(e) => setCustomPriceMax(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-800 bg-white" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleClearPrice} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">ล้าง</button>
                          <button onClick={handleApplyCustomPrice} disabled={!customPriceMin && !customPriceMax}
                            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">เลือก</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Quick Links */}
      {showQuickLinks && countries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">ยอดนิยม:</span>
          {countries.slice(0, 6).map((c) => (
            <Link key={c.id} href={`/tours/country/${c.slug}`}
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
              {c.name_th}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
