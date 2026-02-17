'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Globe,
  Hash,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Download,
  Share2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plane,
  Star,
} from 'lucide-react';
import { tourPackagesApi, TourPackageDetail, internationalToursApi, InternationalTourItem } from '@/lib/api';
import TourTabBadges from '@/components/shared/TourTabBadges';

export default function TourPackageDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [pkg, setPkg] = useState<TourPackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageSettings, setPageSettings] = useState<{
    cover_image_url: string | null;
    cover_image_position: string;
  } | null>(null);
  const [relatedTours, setRelatedTours] = useState<InternationalTourItem[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        const [response, settingsRes] = await Promise.all([
          tourPackagesApi.getBySlug(slug),
          tourPackagesApi.pageSettings(),
        ]);
        if (response?.data) {
          setPkg(response.data);
        } else {
          setError(true);
        }
        if (settingsRes?.cover_image_url !== undefined) setPageSettings(settingsRes);

        // Fetch related tours by country IDs
        if (response?.data?.countries?.length > 0) {
          try {
            const countryIds = response.data.countries.map((c: { id: number }) => c.id);
            const tourPromises = countryIds.map((cid: number) =>
              internationalToursApi.list({ country_id: cid, per_page: 10 })
            );
            const tourResults = await Promise.all(tourPromises);
            const allTours = tourResults.flatMap(r => r?.data || []);
            // Deduplicate by id and limit to 10
            const seen = new Set<number>();
            const unique = allTours.filter(t => {
              if (seen.has(t.id)) return false;
              seen.add(t.id);
              return true;
            }).slice(0, 10);
            setRelatedTours(unique);
          } catch {
            // ignore
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: pkg?.name || 'แพ็คเกจทัวร์', url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('คัดลอกลิงก์แล้ว');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero skeleton */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
          <div className="absolute inset-0 bg-gray-300 animate-pulse" />
          <div className="container-custom relative z-10 pt-8 pb-12 lg:pt-12 lg:pb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-white/30 rounded animate-pulse" />
              <div className="w-20 h-4 bg-white/30 rounded animate-pulse" />
            </div>
            <div className="h-9 bg-white/30 rounded w-2/3 animate-pulse mb-3" />
            <div className="flex gap-2">
              <div className="w-24 h-7 bg-white/20 rounded-lg animate-pulse" />
              <div className="w-24 h-7 bg-white/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="container-custom py-8">
          <div className="max-w-6xl mx-auto">
            {/* Action buttons skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-36 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-20 h-10 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            {/* Image skeleton */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            </div>
            {/* Description skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
            {/* Inclusions & Exclusions skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
            </div>
            {/* Terms skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบแพ็คเกจทัวร์</h2>
          <p className="text-gray-500 mb-4">แพ็คเกจนี้อาจถูกลบหรือหมดอายุแล้ว</p>
          <Link href="/tours/packages" className="text-blue-600 hover:underline font-medium">
            ← กลับไปหน้ารายการแพ็คเกจ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
        {pageSettings?.cover_image_url ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${pageSettings.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: pageSettings.cover_image_position || 'center',
              }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : null}
        <div className="container-custom relative z-10 pt-8 pb-12 lg:pt-12 lg:pb-16">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/tours/packages" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm text-white/60">แพ็คเกจทัวร์</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold">{pkg.name}</h1>
          {pkg.countries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {pkg.countries.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm"
                >
                  {c.iso2 && (
                    <img
                      src={`https://flagcdn.com/16x12/${c.iso2}.png`}
                      alt=""
                      className="w-4 h-3 rounded-[2px]"
                    />
                  )}
                  {c.name_th}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto">
          {/* Action buttons */}
          <div className="flex items-center gap-3 mb-6">
            {pkg.pdf_url && (
              <a
                href={pkg.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด PDF
              </a>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              แชร์
            </button>
          </div>

          {/* Main Image */}
          {pkg.image_url && (
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-8 shadow-lg max-w-3xl mx-auto">
              <Image
                src={pkg.image_url}
                alt={pkg.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </div>
          )}

          {/* Description */}
          {pkg.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                รายละเอียด
              </h2>
              <div className="text-gray-700 leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: pkg.description }} />
            </div>
          )}

          {/* Timeline */}
          {pkg.timeline && pkg.timeline.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Timeline การเที่ยว
              </h2>
              <div className="space-y-4">
                {pkg.timeline.map((t, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {t.day_number}
                      </div>
                      {i < pkg.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-blue-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">วันที่ {t.day_number}</h3>
                      <p className="text-gray-600 whitespace-pre-line">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  รวมในแพ็คเกจ
                </h2>
                <ul className="space-y-2">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pkg.exclusions && pkg.exclusions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  ไม่รวมในแพ็คเกจ
                </h2>
                <ul className="space-y-2">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Terms */}
          {pkg.terms && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                เงื่อนไขการให้บริการ
              </h2>
              <div className="text-gray-700 leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: pkg.terms }} />
            </div>
          )}
           {/* Cancellation Policy */}
          {pkg.cancellation_policy && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                เงื่อนไขในการยกเลิกทัวร์
              </h2>
              <div className="text-gray-700 leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: pkg.cancellation_policy }} />
            </div>
          )}

          {/* Remarks */}
          {pkg.remarks && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                หมายเหตุ
              </h2>
              <div className="text-gray-700 leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: pkg.remarks }} />
            </div>
          )}

         

          {/* Hashtags */}
          {pkg.hashtags && pkg.hashtags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {pkg.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 text-sm rounded-full border border-purple-100"
                  >
                    <Hash className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {pkg.countries.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                ประเทศที่เกี่ยวข้อง
              </h2>
              <div className="flex flex-wrap gap-2">
                {pkg.countries.map((c) => (
                  <Link
                    key={c.id}
                    href={`/tours/country/${c.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    {c.iso2 && (
                      <img
                        src={`https://flagcdn.com/24x18/${c.iso2}.png`}
                        alt=""
                        className="w-6 h-4 object-cover rounded-[2px]"
                      />
                    )}
                    <span className="font-medium">{c.name_th}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Tours Carousel */}
          {relatedTours.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                ทัวร์แนะนำ
              </h2>
              <div className="relative">
                {/* Prev button */}
                {carouselIndex > 0 && (
                  <button
                    onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                {/* Next button */}
                {carouselIndex < relatedTours.length - 3 && (
                  <button
                    onClick={() => setCarouselIndex(Math.min(relatedTours.length - 3, carouselIndex + 1))}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${carouselIndex * (100 / 3 + 1.1)}%)` }}
                  >
                    {relatedTours.map((tour) => {
                      const price = Number(tour.display_price || tour.min_price || 0);
                      const discount = Number(tour.discount_adult || 0);
                      const originalPrice = discount > 0 ? price + discount : null;
                      const isSoldOut = tour.available_seats === 0;
                      return (
                        <Link
                          key={tour.id}
                          href={`/tours/${tour.slug}`}
                          className={`group flex-shrink-0 w-[calc(33.333%-11px)] bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300 ${isSoldOut ? 'opacity-70' : ''}`}
                        >
                          <div className="relative aspect-square overflow-hidden">
                            {isSoldOut && (
                              <div className="absolute -right-8 top-5 rotate-45 bg-red-500 text-white text-[10px] font-bold px-10 py-1 shadow-lg z-20">
                                SOLD OUT
                              </div>
                            )}
                            {tour.cover_image_url ? (
                              <Image
                                src={tour.cover_image_url}
                                alt={tour.title}
                                fill
                                className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isSoldOut ? 'grayscale-[30%]' : ''}`}
                                sizes="(max-width: 768px) 100vw, 300px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-amber-300" />
                              </div>
                            )}
                            {tour.country && (
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                <div className="flex items-center gap-1 text-white text-xs font-medium">
                                  <MapPin className="w-3 h-3" />
                                  {tour.country.name_th}
                                </div>
                              </div>
                            )}
                            {tour.badge && (
                              <span className="absolute top-2 left-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg z-10">
                                {tour.badge}
                              </span>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {tour.tour_code && (
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{tour.tour_code}</span>
                              )}
                              {tour.duration_days > 0 && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {tour.duration_days}วัน{tour.duration_nights > 0 ? ` ${tour.duration_nights}คืน` : ''}
                                </span>
                              )}
                              <TourTabBadges tourId={tour.id} />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-amber-600 transition-colors mb-2">
                              {tour.title}
                            </h3>
                            {price > 0 && (
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-bold text-amber-600">
                                  ฿{price.toLocaleString()}
                                </span>
                                {originalPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ฿{originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="text-center pt-4">
            <Link
              href="/tours/packages"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปหน้ารายการแพ็คเกจทัวร์
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
