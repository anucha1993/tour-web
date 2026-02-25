'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Plane, Calendar, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { InternationalTourFilters, DomesticTourFilters, FestivalTourFilters } from '@/lib/api';

// ===== Types =====
export interface SearchParams {
  search?: string;
  country_id?: string;
  city_id?: string;
  airline_id?: string;
  departure_month?: string;
  departure_date_from?: string;
  departure_date_to?: string;
  return_date?: string;
  price_min?: string;
  price_max?: string;
  min_seats?: string;
  sort_by?: string;
  festival_id?: string;
  promotion?: string;
  theme?: string;
  special_highlight?: string;
}

interface TourSearchFormProps {
  filters: InternationalTourFilters | DomesticTourFilters | FestivalTourFilters;
  onSearch: (params: SearchParams) => void;
  onClear: () => void;
  initialValues?: Partial<SearchParams>;
  hideCountry?: boolean;
  hideCity?: boolean;
  showFilters?: {
    search?: boolean;
    country?: boolean;
    city?: boolean;
    airline?: boolean;
    departureMonth?: boolean;
    priceRange?: boolean;
  };
}

// Helper to safely access optional filter properties across union types
type AnyFilters = InternationalTourFilters & DomesticTourFilters & FestivalTourFilters;

// ===== Helpers =====
const TH_MONTHS: Record<string, string> = {
  '01': 'ม.ค.', '02': 'ก.พ.', '03': 'มี.ค.', '04': 'เม.ย.',
  '05': 'พ.ค.', '06': 'มิ.ย.', '07': 'ก.ค.', '08': 'ส.ค.',
  '09': 'ก.ย.', '10': 'ต.ค.', '11': 'พ.ย.', '12': 'ธ.ค.',
};

const fmtMonth = (ym: string) => {
  const [y, m] = ym.split('-');
  return `${TH_MONTHS[m] || m} ${(parseInt(y) + 543).toString().slice(-2)}`;
};

const monthRange = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return {
    from: `${y}-${String(m).padStart(2, '0')}-01`,
    to: `${y}-${String(m).padStart(2, '0')}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`,
  };
};

const fmtDate = (s: string) => {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
};

// ===== Component =====
export default function TourSearchForm({
  filters: rawFilters,
  onSearch,
  onClear,
  initialValues = {},
  hideCountry = false,
  hideCity = false,
  showFilters = {},
}: TourSearchFormProps) {
  // Cast to intersection type so all optional properties are accessible
  const filters = rawFilters as AnyFilters;
  const [search, setSearch] = useState(initialValues.search || '');
  const [countryId, setCountryId] = useState(initialValues.country_id || '');
  const [cityIds, setCityIds] = useState<string[]>(
    initialValues.city_id ? initialValues.city_id.split(',').filter(Boolean) : []
  );
  const [airlineId, setAirlineId] = useState(initialValues.airline_id || '');
  const [dateFrom, setDateFrom] = useState(initialValues.departure_date_from || '');
  const [dateTo, setDateTo] = useState(initialValues.departure_date_to || '');
  const [returnDate, setReturnDate] = useState(initialValues.return_date || '');
  const [priceMin, setPriceMin] = useState(initialValues.price_min || '');
  const [priceMax, setPriceMax] = useState(initialValues.price_max || '');
  const [minSeats, setMinSeats] = useState(initialValues.min_seats || '');
  const [festivalId, setFestivalId] = useState(initialValues.festival_id || '');
  const [promotion, setPromotion] = useState(initialValues.promotion || '');
  const [theme, setTheme] = useState(initialValues.theme || '');
  const [specialHighlight, setSpecialHighlight] = useState(initialValues.special_highlight || '');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    initialValues.departure_month ? [initialValues.departure_month] : []
  );
  const [showMonthDrop, setShowMonthDrop] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const [airlineSearch, setAirlineSearch] = useState('');
  const [showAirlineDrop, setShowAirlineDrop] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const airlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setShowMonthDrop(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountryDrop(false);
      if (airlineRef.current && !airlineRef.current.contains(e.target as Node)) setShowAirlineDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync country_id from initialValues when it arrives asynchronously
  useEffect(() => {
    if (initialValues.country_id && initialValues.country_id !== countryId) {
      setCountryId(initialValues.country_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.country_id]);

  // ค้นหาประเทศจากข้อความที่พิมพ์
  const filteredCountries = useMemo(() => {
    const list = filters.countries || [];
    if (!countrySearch.trim()) return list;
    const q = countrySearch.trim().toLowerCase();
    return list.filter(c => c.name_th.toLowerCase().includes(q));
  }, [countrySearch, filters.countries]);

  // ชื่อประเทศที่เลือกอยู่
  const selectedCountryName = useMemo(() => {
    if (!countryId) return '';
    const found = (filters.countries || []).find(c => String(c.id) === countryId);
    return found?.name_th || '';
  }, [countryId, filters.countries]);

  // ค้นหาสายการบินจากข้อความที่พิมพ์
  const filteredAirlines = useMemo(() => {
    const list = filters.airlines || [];
    if (!airlineSearch.trim()) return list;
    const q = airlineSearch.trim().toLowerCase();
    return list.filter(a => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
  }, [airlineSearch, filters.airlines]);

  // ชื่อสายการบินที่เลือกอยู่
  const selectedAirlineName = useMemo(() => {
    if (!airlineId) return '';
    const found = (filters.airlines || []).find(a => String(a.id) === airlineId);
    return found ? `${found.name} (${found.code})` : '';
  }, [airlineId, filters.airlines]);

  const show = {
    search: showFilters.search !== false,
    country: showFilters.country !== false && !hideCountry,
    city: showFilters.city !== false && !hideCity,
    airline: showFilters.airline !== false,
    month: showFilters.departureMonth !== false,
    price: showFilters.priceRange !== false,
  };

  const filteredCities = useMemo(() => {
    const allCities = filters.cities || [];
    // When country filter is hidden, show all cities
    if (!show.country) return allCities;
    if (!countryId) return [];
    return allCities.filter(c => c.country_id === Number(countryId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, filters.cities, show.country]);

  const handleCountryChange = (val: string) => {
    setCountryId(val);
    setCityIds([]);
  };

  const toggleMonth = (m: string) => {
    setSelectedMonths(prev => {
      const next = prev.includes(m) ? prev.filter(v => v !== m) : [...prev, m].sort();
      if (next.length === 0) { setDateFrom(''); setDateTo(''); }
      else {
        const ranges = next.map(v => monthRange(v));
        setDateFrom(ranges[0].from);
        setDateTo(ranges[ranges.length - 1].to);
      }
      return next;
    });
  };

  const buildParams = (): SearchParams => {
    const p: SearchParams = {};
    if (search.trim()) p.search = search.trim();
    if (countryId) p.country_id = countryId;
    if (cityIds.length > 0) p.city_id = cityIds.join(',');
    if (airlineId) p.airline_id = airlineId;
    if (dateFrom) p.departure_date_from = dateFrom;
    if (dateTo) p.departure_date_to = dateTo;
    if (returnDate) p.return_date = returnDate;
    if (priceMin) p.price_min = priceMin;
    if (priceMax) p.price_max = priceMax;
    if (minSeats) p.min_seats = minSeats;
    if (festivalId) p.festival_id = festivalId;
    if (promotion) p.promotion = promotion;
    if (theme) p.theme = theme;
    if (specialHighlight) p.special_highlight = specialHighlight;
    return p;
  };

  const handleSearch = () => { setShowMonthDrop(false); onSearch(buildParams()); };
  const handleClear = () => {
    setSearch(''); setCountryId(''); setCityIds([]); setAirlineId('');
    setDateFrom(''); setDateTo(''); setReturnDate('');
    setPriceMin(''); setPriceMax(''); setMinSeats('');
    setSelectedMonths([]); setFestivalId('');
    setPromotion(''); setTheme(''); setSpecialHighlight('');
    onClear();
  };

  const hasActive = [search, countryId, cityIds.length > 0 ? '1' : '', airlineId, dateFrom, dateTo, returnDate, priceMin, priceMax, minSeats, festivalId, promotion, theme, specialHighlight].some(Boolean);
  const advancedCount = [dateFrom && !selectedMonths.length ? dateFrom : '', dateTo && !selectedMonths.length ? dateTo : '', returnDate, priceMin, priceMax, minSeats].filter(Boolean).length;

  const monthLabel = selectedMonths.length > 0
    ? selectedMonths.length <= 2
      ? selectedMonths.map(m => fmtMonth(m)).join(', ')
      : `${selectedMonths.length} เดือน`
    : '';

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-400/20 border border-gray-100 p-4 sm:p-5 space-y-3">
      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-700">ค้นหาโปรแกรมทัวร์</span>
      </div>

      {/* ═══ Main search bar ═══ */}
      <div className="bg-gray-50/50 rounded-xl border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:divide-x lg:divide-gray-200">

          {/* 1) ประเทศ (searchable) */}
          {show.country && (
            <div className="flex-1 min-w-0 px-3 py-2.5 lg:py-3 relative" ref={countryRef}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-600 leading-none mb-0.5">ประเทศ</div>
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-400 placeholder:font-normal truncate"
                    placeholder="ทุกประเทศ"
                    value={showCountryDrop ? countrySearch : (selectedCountryName || countrySearch)}
                    onChange={e => {
                      setCountrySearch(e.target.value);
                      setShowCountryDrop(true);
                      if (!e.target.value) { handleCountryChange(''); }
                    }}
                    onFocus={() => {
                      setShowCountryDrop(true);
                      setCountrySearch('');
                    }}
                  />
                </div>
                {countryId ? (
                  <button onClick={() => { handleCountryChange(''); setCountrySearch(''); }} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform ${showCountryDrop ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Country dropdown */}
              {showCountryDrop && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => { handleCountryChange(''); setCountrySearch(''); setShowCountryDrop(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors ${
                      !countryId ? 'text-orange-600 font-medium bg-orange-50/50' : 'text-gray-600'
                    }`}
                  >
                    ทุกประเทศ
                  </button>
                  {filteredCountries.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { handleCountryChange(String(c.id)); setCountrySearch(''); setShowCountryDrop(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors ${
                        countryId === String(c.id) ? 'text-orange-600 font-medium bg-orange-50/50' : 'text-gray-700'
                      }`}
                    >
                      {c.name_th}
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">ไม่พบประเทศ</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2) โปรแกรมทัวร์ (search) */}
          {show.search && (
            <div className="flex-1 min-w-0 px-3 py-2.5 lg:py-3 border-t lg:border-t-0 border-gray-200">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-600 leading-none mb-0.5">โปรแกรมทัวร์</div>
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="ค้นหา โปรแกรมทัวร์"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3) สายการบิน (searchable) */}
          {show.airline && (
            <div className="flex-1 min-w-0 px-3 py-2.5 lg:py-3 border-t lg:border-t-0 border-gray-200 relative" ref={airlineRef}>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-600 leading-none mb-0.5">สายการบิน</div>
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-400 placeholder:font-normal truncate"
                    placeholder="สายการบินทั้งหมด"
                    value={showAirlineDrop ? airlineSearch : (selectedAirlineName || airlineSearch)}
                    onChange={e => {
                      setAirlineSearch(e.target.value);
                      setShowAirlineDrop(true);
                      if (!e.target.value) { setAirlineId(''); }
                    }}
                    onFocus={() => {
                      setShowAirlineDrop(true);
                      setAirlineSearch('');
                    }}
                  />
                </div>
                {airlineId ? (
                  <button onClick={() => { setAirlineId(''); setAirlineSearch(''); }} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform ${showAirlineDrop ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Airline dropdown */}
              {showAirlineDrop && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => { setAirlineId(''); setAirlineSearch(''); setShowAirlineDrop(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors ${
                      !airlineId ? 'text-orange-600 font-medium bg-orange-50/50' : 'text-gray-600'
                    }`}
                  >
                    สายการบินทั้งหมด
                  </button>
                  {filteredAirlines.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setAirlineId(String(a.id)); setAirlineSearch(''); setShowAirlineDrop(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors ${
                        airlineId === String(a.id) ? 'text-orange-600 font-medium bg-orange-50/50' : 'text-gray-700'
                      }`}
                    >
                      {a.name} ({a.code})
                    </button>
                  ))}
                  {filteredAirlines.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">ไม่พบสายการบิน</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4) เดือนที่เดินทาง */}
          {show.month && (
            <div className="flex-1 min-w-0 px-3 py-2.5 lg:py-3 border-t lg:border-t-0 border-gray-200 relative" ref={monthRef}>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowMonthDrop(!showMonthDrop)}>
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-600 leading-none mb-0.5">เดือนที่เดินทาง</div>
                  <div className={`text-sm font-medium truncate ${monthLabel ? 'text-gray-800' : 'text-gray-400'}`}>
                    {monthLabel || 'วันเดินทางทั้งหมด'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform ${showMonthDrop ? 'rotate-180' : ''}`} />
              </div>

              {/* Month dropdown */}
              {showMonthDrop && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-3 min-w-[240px]">
                  {(filters.departure_months || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(filters.departure_months || []).map(m => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => toggleMonth(m.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedMonths.includes(m.value)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          {fmtMonth(m.value)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">ไม่มีรอบเดินทาง</p>
                  )}
                  {selectedMonths.length > 0 && (
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">เลือก {selectedMonths.length} เดือน</span>
                      <button onClick={() => { setSelectedMonths([]); setDateFrom(''); setDateTo(''); }} className="text-xs text-orange-500 hover:text-orange-600 font-medium">ล้าง</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clear + Search button */}
          <div className="flex items-center gap-2 px-3 py-2.5 lg:py-3 border-t lg:border-t-0 border-gray-200 shrink-0">
            {hasActive && (
              <button onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap">
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" />
              ค้นหา
            </button>
          </div>
        </div>
      </div>

      {/* ═══ City badges (เมื่อเลือกประเทศแล้ว หรือเมื่อซ่อน country filter) ═══ */}
      {show.city && (countryId || !show.country) && filteredCities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filteredCities.map(c => {
            const isSelected = cityIds.includes(String(c.id));
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  const newIds = isSelected
                    ? cityIds.filter(id => id !== String(c.id))
                    : [...cityIds, String(c.id)];
                  setCityIds(newIds);
                  const p = buildParams();
                  if (newIds.length > 0) p.city_id = newIds.join(','); else delete p.city_id;
                  onSearch(p);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
                }`}
              >
                {c.name_th}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Festival / Holiday badges ═══ */}
      {(filters.festivals ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400">🎉 เทศกาล:</span>
          {(filters.festivals ?? []).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                const newId = festivalId === String(f.id) ? '' : String(f.id);
                setFestivalId(newId);
                const p = buildParams();
                if (newId) p.festival_id = newId; else delete p.festival_id;
                onSearch(p);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                festivalId === String(f.id)
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
              }`}
            >
              {f.badge_icon && <span className="mr-1">{f.badge_icon}</span>}
              {f.badge_text || f.name}
            </button>
          ))}
        </div>
      )}

      {/* ═══ Promotion badges ═══ */}
      {(filters.promotions ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400">🏷️ โปรโมชั่น:</span>
          {(filters.promotions ?? []).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                const newVal = promotion === name ? '' : name;
                setPromotion(newVal);
                const p = buildParams();
                if (newVal) p.promotion = newVal; else delete p.promotion;
                onSearch(p);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                promotion === name
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-pink-600 border-pink-300 hover:bg-pink-50'
              }`}
            >
              ✨ {name}
            </button>
          ))}
        </div>
      )}

      {/* ═══ Theme badges ═══ */}
      {(filters.themes ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400">📂 หมวดหมู่:</span>
          {(filters.themes ?? []).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                const newVal = theme === name ? '' : name;
                setTheme(newVal);
                const p = buildParams();
                if (newVal) p.theme = newVal; else delete p.theme;
                onSearch(p);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                theme === name
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* ═══ Special Highlight badges ═══ */}
      {(filters.special_highlights ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400">⭐ ไฮไลท์พิเศษ:</span>
          {(filters.special_highlights ?? []).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                const newVal = specialHighlight === name ? '' : name;
                setSpecialHighlight(newVal);
                const p = buildParams();
                if (newVal) p.special_highlight = newVal; else delete p.special_highlight;
                onSearch(p);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                specialHighlight === name
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* ═══ Advanced toggle ═══ */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors"
        >
          <SlidersHorizontal className="w-3 h-3" />
          ตัวกรองเพิ่มเติม
          {advancedCount > 0 && (
            <span className="bg-orange-500 text-white text-[14px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">{advancedCount}</span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ═══ Advanced filters panel ═══ */}
      {showAdvanced && (
        <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* วันเดินทาง */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1">วันเดินทาง (จาก)</label>
              <input type="date" value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setSelectedMonths([]); }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-700" />
              {dateFrom && <p className="text-[14px] text-gray-600 mt-0.5">{fmtDate(dateFrom)}</p>}
            </div>

            {/* วันกลับ (ช่วง) */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1">วันเดินทาง (ถึง)</label>
              <input type="date" value={dateTo}
                onChange={e => { setDateTo(e.target.value); setSelectedMonths([]); }}
                min={dateFrom || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-700" />
              {dateTo && <p className="text-[14px] text-gray-600 mt-0.5">{fmtDate(dateTo)}</p>}
            </div>

            {/* วันกลับ (ตรงวัน) */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1">วันกลับ (ตรงวัน)</label>
              <input type="date" value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                min={dateFrom || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-700" />
              {returnDate && <p className="text-[14px] text-orange-500 mt-0.5">เฉพาะกลับ {fmtDate(returnDate)}</p>}
            </div>

            {/* ที่นั่งว่าง */}
            <div>
              <label className="block text-[14px] text-gray-600 mb-1">ที่นั่งว่างขั้นต่ำ</label>
              <input type="number" value={minSeats}
                onChange={e => setMinSeats(e.target.value)}
                min="1" max="50" placeholder="จำนวน"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-700" />
            </div>
          </div>

          {/* Price row */}
          {show.price && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[14px] text-gray-600 mb-1">ราคาต่ำสุด (฿)</label>
                <input type="number" value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  min="0" step="1000" placeholder="฿ ไม่จำกัด"
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-700" />
              </div>
              <div>
                <label className="block text-[14px] text-gray-600 mb-1">ราคาสูงสุด (฿)</label>
                <input type="number" value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  min="0" step="1000" placeholder="฿ ไม่จำกัด"
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-700" />
              </div>
            </div>
          )}

          {/* Apply row */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={() => { handleClear(); setShowAdvanced(false); }} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5">ล้างทั้งหมด</button>
            <button type="button" onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">ค้นหา</button>
          </div>
        </div>
      )}
    </div>
  );
}
