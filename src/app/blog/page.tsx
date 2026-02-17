'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, Clock, Eye, Search, Tag, ChevronLeft, ChevronRight,
  BookOpen, ArrowRight,
} from 'lucide-react';
import { blogApi, BlogPost, BlogCategory, BlogPageSettings } from '@/lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [pageSettings, setPageSettings] = useState<BlogPageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch categories + featured posts + page settings on mount
  useEffect(() => {
    blogApi.getSettings().then(res => {
      const data = (res as unknown as { data: BlogPageSettings })?.data;
      if (data) setPageSettings(data);
    }).catch(() => {});

    blogApi.getCategories().then(res => {
      const data = (res as unknown as { data: BlogCategory[] })?.data;
      if (data) setCategories(data);
    }).catch(() => {});

    blogApi.getPosts({ featured: true, per_page: 3 }).then(res => {
      const raw = res as unknown as { data: BlogPost[] };
      if (raw?.data) setFeaturedPosts(raw.data);
    }).catch(() => {});
  }, []);

  // Fetch posts when filters change
  useEffect(() => {
    let cancelled = false;
    blogApi.getPosts({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
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
  }, [selectedCategory, searchQuery, currentPage]);

  const handleCategoryChange = (slug: string) => {
    setLoading(true);
    setSelectedCategory(slug === selectedCategory ? '' : slug);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPage(1);
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

  // Show hero skeleton on initial load
  const showHeroSkeleton = loading && !heroPost && !selectedCategory && !searchQuery && currentPage === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      {showHeroSkeleton && <HeroSkeleton />}

      {/* Hero Section with Featured Post */}
      {heroPost && !selectedCategory && !searchQuery && currentPage === 1 && (
        <section className="relative  text-white w-full ">
          {/* Background cover image from settings */}
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
                  <Image
                    src={heroPost.cover_image_url}
                    alt={heroPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Page Header (when no featured hero) */}
      {(!heroPost || selectedCategory || searchQuery || currentPage > 1) && (
        <section className="relative text-white py-16 md:py-20 overflow-hidden">
          {/* Background: cover image from settings or gradient */}
          {heroImage ? (
            <>
              <Image src={heroImage} alt="" fill className="object-cover" style={{ objectPosition: heroImagePos }} priority />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/20 translate-y-1/3 -translate-x-1/4" />
              </div>
            </>
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

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-[80px] lg:top-[160px] z-30">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 w-full md:w-auto">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  !selectedCategory
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.slug
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                  {cat.posts_count ? (
                    <span className="ml-1 text-xs opacity-70">({cat.posts_count})</span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="ค้นหาบทความ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border-1 border-solid border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container-custom py-10">
        {loading ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่พบบทความ</h3>
            <p className="text-gray-400">ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
          </div>
        ) : (
          <>
            {/* Results info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                แสดง {posts.length} จาก {total} บทความ
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="p-2 rounded-lg border-1 border-solid border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                            : 'border-1 border-solid border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  className="p-2 rounded-lg border-1 border-solid border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ===================== Hero Skeleton =====================
function HeroSkeleton() {
  return (
    <section className="relative bg-gray-200 w-full animate-pulse">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <div className="h-3 w-32 bg-gray-300 rounded" />
            </div>
            <div className="h-10 w-4/5 bg-gray-300 rounded mb-3" />
            <div className="h-10 w-3/5 bg-gray-300 rounded mb-4" />
            <div className="h-4 w-full bg-gray-300 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-300 rounded mb-6" />
            <div className="flex items-center gap-4 mb-6">
              <div className="h-6 w-20 bg-gray-300 rounded-full" />
              <div className="h-4 w-28 bg-gray-300 rounded" />
              <div className="h-4 w-16 bg-gray-300 rounded" />
            </div>
            <div className="h-12 w-40 bg-gray-300 rounded-lg" />
          </div>
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-300" />
        </div>
      </div>
    </section>
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
