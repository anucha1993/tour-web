'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  MapPin,
  Building2,
  PartyPopper,
  Plane,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { searchApi, SearchAutocompleteItem, PopularSearchData } from '@/lib/api';

const TYPE_CONFIG = {
  country: { icon: MapPin, label: 'ประเทศ', color: 'text-blue-600 bg-blue-50' },
  city: { icon: Building2, label: 'เมือง', color: 'text-purple-600 bg-purple-50' },
  festival: { icon: PartyPopper, label: 'เทศกาล', color: 'text-orange-600 bg-orange-50' },
  tour: { icon: Plane, label: 'ทัวร์', color: 'text-green-600 bg-green-50' },
};

const RECENT_KEY = 'search_recent';
const MAX_RECENT = 8;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(q: string) {
  if (typeof window === 'undefined' || !q.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== q.trim());
  recent.unshift(q.trim());
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(RECENT_KEY);
  }
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchAutocompleteItem[]>([]);
  const [popular, setPopular] = useState<PopularSearchData | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
      // Load popular searches
      searchApi.popular().then((res) => {
        if (res?.data) setPopular(res.data);
      }).catch(() => {});
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced autocomplete
  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.autocomplete(q);
        if (res?.data) {
          setResults(res.data);
          setSelectedIndex(-1);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  useEffect(() => {
    doSearch(query);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Navigate to result
  const handleNavigate = (url: string, searchTerm?: string) => {
    if (searchTerm) addRecentSearch(searchTerm);
    onClose();
    router.push(url);
  };

  // Full search
  const handleFullSearch = () => {
    if (query.trim().length < 2) return;
    addRecentSearch(query.trim());
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleNavigate(items[selectedIndex].url, items[selectedIndex].title);
      } else {
        handleFullSearch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const el = resultsRef.current.children[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length >= 2;
  const showResults = hasQuery && results.length > 0;
  const showEmpty = hasQuery && !loading && results.length === 0;
  const showPopular = !hasQuery;

  // Group results by type
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, SearchAutocompleteItem[]>);

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="relative max-w-2xl mx-auto mt-[10vh] sm:mt-[15vh]">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-0 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ค้นหาทัวร์ ประเทศ เมือง เทศกาล..."
              className="flex-1 text-base sm:text-lg outline-none placeholder:text-gray-400 text-gray-900"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {loading && <Loader2 className="w-5 h-5 text-orange-500 animate-spin flex-shrink-0" />}
            {query && !loading && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ปิด
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto" ref={resultsRef}>
            {/* Autocomplete Results */}
            {showResults && (
              <div className="py-2">
                {(['country', 'city', 'festival', 'tour'] as const).map((type) => {
                  const items = grouped[type];
                  if (!items?.length) return null;
                  const config = TYPE_CONFIG[type];
                  const TypeIcon = config.icon;

                  return (
                    <div key={type}>
                      <div className="px-5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {config.label}
                      </div>
                      {items.map((item) => {
                        const currentIndex = flatIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        return (
                          <button
                            key={`${item.type}-${item.id}`}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                              isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleNavigate(item.url, item.title)}
                          >
                            {/* Icon/Image */}
                            <div className="flex-shrink-0">
                              {item.type === 'tour' && item.image ? (
                                <div className="w-12 h-9 relative rounded overflow-hidden bg-gray-100">
                                  <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
                                </div>
                              ) : item.image ? (
                                <img src={item.image} alt="" className="w-8 h-6 object-cover rounded-[2px]" />
                              ) : item.icon ? (
                                <span className="text-xl">{item.icon}</span>
                              ) : (
                                <div className={`p-1.5 rounded-lg ${config.color}`}>
                                  <TypeIcon className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {highlightMatch(item.title, query)}
                              </div>
                              {item.subtitle && (
                                <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                              )}
                            </div>

                            {/* Right side */}
                            <div className="flex-shrink-0 text-right">
                              {item.type === 'tour' && item.price ? (
                                <span className="text-sm font-bold text-orange-600">฿{item.price}</span>
                              ) : item.tour_count ? (
                                <span className="text-xs text-gray-400">{item.tour_count} ทัวร์</span>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Full search button */}
                <div className="px-5 py-3 border-t border-gray-100">
                  <button
                    onClick={handleFullSearch}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    ดูผลลัพธ์ทั้งหมดสำหรับ &ldquo;{query}&rdquo;
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="px-5 py-10 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">ไม่พบผลลัพธ์สำหรับ &ldquo;{query}&rdquo;</p>
                <p className="text-gray-400 text-xs mt-1">ลองค้นหาด้วยคำอื่น เช่น ชื่อประเทศ เมือง หรือรหัสทัวร์</p>
              </div>
            )}

            {/* Popular / Default state */}
            {showPopular && (
              <div className="py-3">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between px-5 py-1.5">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ค้นหาล่าสุด
                      </span>
                      <button
                        onClick={() => {
                          clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ล้าง
                      </button>
                    </div>
                    <div className="px-5 flex flex-wrap gap-1.5 pb-3">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setQuery(term);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-full text-xs text-gray-600 hover:text-orange-700 transition-colors"
                        >
                          <Clock className="w-3 h-3 text-gray-400" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Destinations */}
                {popular?.popular_destinations && popular.popular_destinations.length > 0 && (
                  <div className="mb-2">
                    <div className="px-5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      จุดหมายยอดนิยม
                    </div>
                    <div className="px-5 flex flex-wrap gap-1.5 pb-3">
                      {popular.popular_destinations.map((dest) => (
                        <button
                          key={dest.title}
                          onClick={() => handleNavigate(dest.url, dest.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-full text-xs text-blue-700 transition-colors"
                        >
                          {dest.image ? (
                            <img src={dest.image} alt="" className="w-4 h-3 object-cover rounded-[2px]" />
                          ) : dest.icon ? (
                            <span>{dest.icon}</span>
                          ) : null}
                          {dest.title}
                          <span className="text-blue-400">({dest.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Festivals */}
                {popular?.festivals && popular.festivals.length > 0 && (
                  <div className="mb-2">
                    <div className="px-5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <PartyPopper className="w-3 h-3" />
                      เทศกาล
                    </div>
                    <div className="px-5 flex flex-wrap gap-1.5 pb-3">
                      {popular.festivals.map((fest) => (
                        <button
                          key={fest.title}
                          onClick={() => handleNavigate(fest.url, fest.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-100 hover:border-orange-200 rounded-full text-xs text-orange-700 transition-colors"
                        >
                          {fest.icon && <span>{fest.icon}</span>}
                          {fest.title}
                          <span className="text-orange-400">({fest.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Tours */}
                {popular?.trending_tours && popular.trending_tours.length > 0 && (
                  <div>
                    <div className="px-5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      ทัวร์ยอดนิยม
                    </div>
                    {popular.trending_tours.map((tour, i) => (
                      <button
                        key={i}
                        onClick={() => handleNavigate(tour.url, tour.title)}
                        className="w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        {tour.image ? (
                          <div className="w-14 h-10 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={tour.image} alt="" fill className="object-cover" sizes="56px" />
                          </div>
                        ) : (
                          <div className="w-14 h-10 bg-gray-100 rounded flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate">{tour.title}</div>
                          {tour.country && (
                            <div className="text-xs text-gray-400">{tour.country}</div>
                          )}
                        </div>
                        {tour.price && (
                          <span className="text-sm font-bold text-orange-600 flex-shrink-0">฿{tour.price}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">↑↓</kbd> เลือก</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">Enter</kbd> เปิด</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">Esc</kbd> ปิด</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Highlight matching text
function highlightMatch(text: string, query: string) {
  if (!query || query.length < 2) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
