'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, Clock, Eye, Search, Tag, ChevronLeft, ChevronRight,
  BookOpen, ArrowRight, Globe, MapPin, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import {
  blogApi,
  BlogPost,
  BlogCategory,
  BlogPageSettings,
  BlogFilterCountry,
  BlogFilterCity,
} from '@/lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [pageSettings, setPageSettings] = useState<BlogPageSettings | null>(null);
  const [countries, setCountries] = useState<BlogFilterCountry[]>([]);
  const [cities, setCities] = useState<BlogFilterCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    countries: true,
    cities: true,
  });

  // Fetch static data on mount
  useEffect(() => {
    blogApi.getSettings().then(res => {
      const data = (res as unknown as { data: BlogPageSettings })?.data;
      if (data) setPageSettings(data);
    }).catch(() => {});

    blogApi.getCategories().then(res => {
      const data = (res as unknown as { data: BlogCategory[] })?.data;
      if (data) setCategories(data);
    }).catch(() => {});

    blogApi.getFilters().then(res => {
      const raw = res as unknown as { countries: BlogFilterCountry[]; cities: BlogFilterCity[] };
      if (raw?.countries) setCountries(raw.countries);
      if (raw?.cities) setCities(raw.cities);
    }).catch(() => {});

    blogApi.getPosts({ featured: true, per_page: 3 }).then(res => {
      const raw = res as unknown as { data: BlogPost[] };
      if (raw?.data) setFeaturedPosts(raw.data);
    }).catch(() => {});
  }, []);

  // Fetch posts when filters/page change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    blogApi.getPosts({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      country_id: selectedCountryId ?? undefined,
      city_id: selectedCityId ?? undefined,
      page: currentPage,
      per_page: 12,
    }).then(res => {
      if (cancelled) return;
      const raw = res as unknown as { data: BlogPost[]; current_page: number; last_page: number; total: number };
      if (raw) {
        setPosts(raw.data || []);
        setLastPage(raw.last_page || 1);
        setTotal(raw.total || 0);
      }
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCategory, searchQuery, selectedCountryId, selectedCityId, currentPage]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? '' : slug);
    setCurrentPage(1);
  };

  const handleCountryChange = (id: number) => {
    if (selectedCountryId === id) {
      setSelectedCountryId(null);
      setSelectedCityId(null);
    } else {
      setSelectedCountryId(id);
      setSelectedCityId(null);
    }
    setCurrentPage(1);
  };

  const handleCityChange = (id: number) => {
    setSelectedCityId(selectedCityId === id ? null : id);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedCountryId(null);
    setSelectedCityId(null);
    setSearchQuery('');
    setSearchInput('');
    setCurrentPage(1);
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const heroPost = featuredPosts[0];
  const heroTitle = pageSettings?.hero_title || 'รอบรู้เรื่องเที่ยว';
  const heroSubtitle = pageSettings?.hero_subtitle || 'บทความท่องเที่ยว เคล็ดลับ และแรงบันดาลใจสำหรับการเดินทาง';
  const heroImage = pageSettings?.hero_image_url;
  const heroImagePos = pageSettings?.hero_image_position || 'center';

  const isFiltered = !!(selectedCategory || selectedCountryId || selectedCityId || searchQuery);

  // Cities filtered by selected country
  const visibleCities = selectedCountryId
    ? cities.filter(c => c.country_id === selectedCountryId)
    : cities;

  const selectedCountry = countries.find(c => c.id === selectedCountryId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {heroPost && !isFiltered && currentPage === 1 ? (
        <section className="relative text-white w-full">
          {heroImage && (
            <>
              <Image src={heroImage} alt="" fill className="object-cover" style={{ objectPosition: heroImagePos }} priority />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            </>
          )}
          <div className="container-custom py-12 md:py-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">{heroTitle}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {heroPost.title}
                </h1>
                {heroPost.excerpt && (
                  <p className="text-lg text-white/80 mb-6 line-clamp-3">{heroPost.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
                  {heroPost.category && (
                    <span className="bg-white/20 px-3 py-1 rounded-full">{heroPost.category.name}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(heroPost.published_at)}
                  </span>
                  {heroPost.reading_time_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {heroPost.reading_time_min} นาที
                    </span>
                  )}
                </div>
                <Link
                  href={`/blog/${heroPost.slug}`}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  อ่านบทความ <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {heroPost.cover_image_url && (
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-2xl">
                  <Image src={heroPost.cover_image_url} alt={heroPost.title} fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="relative text-white py-16 md:py-20 overflow-hidden">
          {heroImage ? (
            <>
              <Image src={heroImage} alt="" fill className="object-cover" style={{ objectPosition: heroImagePos }} priority />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
          )}
          <div className="container-custom text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-widest text-white/70">Travel Blog</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{heroTitle}</h1>
            {heroSubtitle && (
              <p className="text-lg text-white/80 max-w-xl mx-auto">{heroSubtitle}</p>
            )}
          </div>
        </section>
      )}

      {/* Main Content: Sidebar + Posts */}
      <div className="container-custom py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ===== SIDEBAR ===== */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-[100px] space-y-5">

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">ค้นหา</h3>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาบทความ..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => { setSearchInput(''); setSearchQuery(''); setCurrentPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>
              </div>

              {/* Active Filters Summary */}
              {isFiltered && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-orange-700">ตัวกรองที่ใช้</h3>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                        {categories.find(c => c.slug === selectedCategory)?.name}
                        <button onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedCountry && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                        {selectedCountry.flag_emoji} {selectedCountry.name_th}
                        <button onClick={() => { setSelectedCountryId(null); setSelectedCityId(null); setCurrentPage(1); }}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedCityId && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                        {cities.find(c => c.id === selectedCityId)?.name_th}
                        <button onClick={() => { setSelectedCityId(null); setCurrentPage(1); }}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                        &ldquo;{searchQuery}&rdquo;
                        <button onClick={() => { setSearchQuery(''); setSearchInput(''); setCurrentPage(1); }}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">หมวดหมู่</h3>
                    {openSections.categories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {openSections.categories && (
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => handleCategoryChange('')}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition hover:bg-gray-50 ${!selectedCategory ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'}`}
                      >
                        <span>ทั้งหมด</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${!selectedCategory ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                          {categories.reduce((sum, c) => sum + (c.posts_count || 0), 0)}
                        </span>
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition hover:bg-gray-50 ${selectedCategory === cat.slug ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'}`}
                        >
                          <span>{cat.name}</span>
                          {cat.posts_count ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.slug ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                              {cat.posts_count}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Countries */}
              {countries.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('countries')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" /> ประเทศ
                    </h3>
                    {openSections.countries ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {openSections.countries && (
                    <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
                      {countries.map(country => (
                        <button
                          key={country.id}
                          onClick={() => handleCountryChange(country.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition hover:bg-gray-50 ${selectedCountryId === country.id ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'}`}
                        >
                          <span className="flex items-center gap-2">
                            {country.flag_emoji
                              ? <span className="text-base">{country.flag_emoji}</span>
                              : <Globe className="w-4 h-4 text-gray-300" />
                            }
                            {country.name_th}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${selectedCountryId === country.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                            {country.posts_count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cities */}
              {visibleCities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('cities')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" /> เมือง
                      {selectedCountry && <span className="text-xs font-normal text-gray-400">({selectedCountry.name_th})</span>}
                    </h3>
                    {openSections.cities ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {openSections.cities && (
                    <div className="border-t border-gray-100 max-h-52 overflow-y-auto">
                      {visibleCities.map(city => (
                        <button
                          key={city.id}
                          onClick={() => handleCityChange(city.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition hover:bg-gray-50 ${selectedCityId === city.id ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'}`}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            {city.name_th}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${selectedCityId === city.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                            {city.posts_count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </aside>

          {/* ===== POSTS AREA ===== */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
                </div>
              </>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่พบบทความ</h3>
                <p className="text-gray-400 mb-4">ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
                {isFiltered && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-300 px-4 py-2 rounded-lg"
                  >
                    <X className="w-4 h-4" /> ล้างตัวกรอง
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-500">
                    แสดง <span className="font-semibold text-gray-700">{posts.length}</span> จาก <span className="font-semibold text-gray-700">{total}</span> บทความ
                  </p>
                </div>

                {/* Post Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} formatDate={formatDate} />
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2)
                      .reduce<(number | string)[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        typeof item === 'string' ? (
                          <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                              currentPage === item
                                ? 'bg-orange-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                      disabled={currentPage >= lastPage}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ===================== Post Card Skeleton =====================
function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-full bg-gray-200 rounded mb-2" />
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-full bg-gray-100 rounded mb-1" />
        <div className="h-3 w-2/3 bg-gray-100 rounded mb-4 flex-1" />
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-gray-100">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <div className="h-3 w-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ===================== Post Card =====================
function PostCard({ post, formatDate }: { post: BlogPost; formatDate: (d: string | null) => string }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
              <BookOpen className="w-12 h-12 text-orange-300" />
            </div>
          )}
          {post.is_featured && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              แนะนำ
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category & Date */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            {post.category && (
              <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                {post.category.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.published_at)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
            {post.reading_time_min && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.reading_time_min} นาที
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.view_count.toLocaleString()}
            </span>
            {post.tags && post.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {post.tags.length}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
