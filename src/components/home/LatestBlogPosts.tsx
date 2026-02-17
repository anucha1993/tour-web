'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, BookOpen, ArrowRight } from 'lucide-react';
import { blogApi, BlogPost } from '@/lib/api';

export default function LatestBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getPosts({ per_page: 6 }).then(res => {
      const raw = res as unknown as { data: BlogPost[] };
      if (raw?.data) setPosts(raw.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // Don't render if no posts
  if (!loading && posts.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Blog</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              รอบรู้เรื่องเที่ยว
            </h2>
            <p className="text-gray-500 mt-1">
              บทความท่องเที่ยว เคล็ดลับ และแรงบันดาลใจสำหรับการเดินทาง
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-1 text-orange-500 font-semibold hover:text-orange-600 transition whitespace-nowrap"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <>
            {/* Featured (first post) + Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Featured Post — Large Card */}
              <Link href={`/blog/${posts[0].slug}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    {posts[0].cover_image_url ? (
                      <Image
                        src={posts[0].cover_image_url}
                        alt={posts[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                        <BookOpen className="w-16 h-16 text-orange-300" />
                      </div>
                    )}
                    {posts[0].is_featured && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        แนะนำ
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      {posts[0].category && (
                        <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                          {posts[0].category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(posts[0].published_at)}
                      </span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {posts[0].title}
                    </h3>
                    {posts[0].excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4 flex-1">{posts[0].excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                      {posts[0].reading_time_min && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {posts[0].reading_time_min} นาที
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {posts[0].view_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* 2 Smaller Cards stacked on the right */}
              <div className="flex flex-col gap-6">
                {posts.slice(1, 3).map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex-1">
                    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-row">
                      <div className="relative w-40 md:w-48 flex-shrink-0 overflow-hidden bg-gray-100">
                        {post.cover_image_url ? (
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                            <BookOpen className="w-8 h-8 text-orange-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          {post.category && (
                            <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                              {post.category.name}
                            </span>
                          )}
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                          {post.reading_time_min && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {post.reading_time_min} นาที
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {post.view_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom row — 3 smaller cards */}
            {posts.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.slice(3, 6).map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
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
                            <BookOpen className="w-10 h-10 text-orange-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          {post.category && (
                            <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                              {post.category.name}
                            </span>
                          )}
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile View All Button */}
            <div className="text-center mt-8 md:hidden">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                ดูบทความทั้งหมด <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
