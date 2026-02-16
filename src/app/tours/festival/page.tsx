'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { festivalToursApi, FestivalHolidayPublic } from '@/lib/api';

const BADGE_BG_CLASSES: Record<string, string> = {
  red: 'bg-gradient-to-r from-red-600 to-orange-500',
  orange: 'bg-gradient-to-r from-orange-500 to-yellow-400',
  yellow: 'bg-gradient-to-r from-amber-400 to-yellow-300 !text-yellow-900',
  green: 'bg-gradient-to-r from-green-500 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-400',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-400',
};

function FestivalCard({ festival }: { festival: FestivalHolidayPublic }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image — clickable to festival detail */}
      <Link href={`/tours/festival/${festival.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          {festival.image_url ? (
            <Image
              src={festival.image_url}
              alt={festival.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-orange-300" />
            </div>
          )}
          {/* Badge overlay */}
          {festival.badge_text && (
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg ${BADGE_BG_CLASSES[festival.badge_color] || 'bg-gray-500'} ${festival.badge_color === 'yellow' ? '!text-yellow-900' : ''}`}>
                {festival.badge_icon && <span>{festival.badge_icon}</span>}
                {festival.badge_text}
              </span>
            </div>
          )}
          {/* Tour count overlay */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              {festival.tour_count} ทัวร์
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/tours/festival/${festival.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {festival.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span>{festival.date_range_text}</span>
        </div>
        {festival.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{festival.description}</p>
        )}

        {/* Country breakdown */}
        {festival.countries && festival.countries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {festival.countries.map((country) => (
                <Link
                  key={country.id}
                  href={`/tours/festival/${encodeURIComponent(festival.slug)}?country_id=${country.id}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs text-gray-700 hover:text-orange-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {country.iso2 && (
                    <img
                      src={`https://flagcdn.com/16x12/${country.iso2}.png`}
                      alt=""
                      className="w-4 h-3 object-cover rounded-[2px]"
                    />
                  )}
                  <span className="font-medium">{country.name_th}</span>
                  <span className="text-gray-400">({country.tour_count})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FestivalToursPage() {
  const [festivals, setFestivals] = useState<FestivalHolidayPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState<{ cover_image_url: string | null; cover_image_position: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [festivalsRes, settingsRes] = await Promise.all([
          festivalToursApi.list(),
          festivalToursApi.pageSettings(),
        ]);
        if (festivalsRes?.data) {
          setFestivals(festivalsRes.data);
        }
        if (settingsRes?.cover_image_url !== undefined) {
          setPageSettings(settingsRes);
        }
      } catch (error) {
        console.error('Failed to fetch festivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-rose-500 to-orange-500 text-white overflow-hidden">
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
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        )}
        <div className="container-custom relative z-10 pt-8 pb-12 lg:pt-12 lg:pb-16">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-3xl">🎉</span>
            <h1 className="text-3xl lg:text-4xl font-bold">ทัวร์ตามเทศกาล</h1>
          </div>
          <p className="text-white/80 text-base lg:text-lg ml-8">
            รวมทัวร์สำหรับวันหยุดและเทศกาลสำคัญ เลือกเทศกาลที่สนใจเพื่อดูทัวร์ที่พร้อมเดินทาง
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : festivals.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีเทศกาลที่เปิดให้บริการ</h3>
            <p className="text-gray-500">กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-base text-gray-600">
                <strong className="text-gray-900">{festivals.length}</strong> เทศกาล
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festivals.map(festival => (
                <FestivalCard key={festival.id} festival={festival} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
