'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, Clock, Eye, Tag, ChevronRight, ArrowLeft,
  BookOpen, Share2, Loader2, Facebook, Twitter,
} from 'lucide-react';
import { blogApi, BlogPost } from '@/lib/api';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    blogApi.getPost(slug).then(res => {
      const raw = res as unknown as { data: BlogPost; related: BlogPost[] };
      if (raw?.data) {
        setPost(raw.data);
        setRelated(raw.related || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = post?.title || '';
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      copy: '',
    };
    if (platform === 'copy') {
      navigator.clipboard?.writeText(url);
      return;
    }
    if (shareUrls[platform]) window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-600">ไม่พบบทความ</h2>
        <Link href="/blog" className="text-orange-500 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้าบทความ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="relative w-full h-[300px] md:h-[450px] bg-gray-100">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <Link href="/" className="hover:text-orange-500">หน้าหลัก</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/blog" className="hover:text-orange-500">รอบรู้เรื่องเที่ยว</Link>
          {post.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-orange-500">
                {post.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Category Badge */}
            {post.category && (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="inline-block text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition mb-3"
              >
                {post.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              {post.author_name && (
                <div className="flex items-center gap-2">
                  {post.author_avatar_url ? (
                    <Image
                      src={post.author_avatar_url}
                      alt={post.author_name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {post.author_name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{post.author_name}</span>
                </div>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
              {post.reading_time_min && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  อ่าน {post.reading_time_min} นาที
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.view_count.toLocaleString()} ครั้ง
              </span>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-gray-600 italic border-l-4 border-orange-400 pl-4 mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Content */}
            {post.content && (
              <div
                className="rich-text prose prose-lg max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <Share2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">แชร์บทความ:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('line')}
                className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition text-xs font-bold"
                aria-label="Share on LINE"
              >
                LINE
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="text-sm text-gray-500 hover:text-orange-500 transition ml-1"
              >
                คัดลอกลิงก์
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[180px] space-y-6">
              {/* Author Card */}
              {post.author_name && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  {post.author_avatar_url ? (
                    <Image
                      src={post.author_avatar_url}
                      alt={post.author_name}
                      width={80}
                      height={80}
                      className="rounded-full mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold mx-auto mb-3">
                      {post.author_name.charAt(0)}
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900">{post.author_name}</h4>
                  <p className="text-sm text-gray-500 mt-1">ผู้เขียน</p>
                </div>
              )}

              {/* Related Posts */}
              {related.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">บทความที่เกี่ยวข้อง</h3>
                  <div className="space-y-4">
                    {related.map(r => (
                      <Link key={r.id} href={`/blog/${r.slug}`} className="flex gap-3 group">
                        <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          {r.cover_image_url ? (
                            <Image src={r.cover_image_url} alt={r.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {r.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(r.published_at)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Blog */}
              <Link
                href="/blog"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-1 border-solid border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้าบทความ
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
