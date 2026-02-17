'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Globe, Hash } from 'lucide-react';
import { tourPackagesApi, TourPackagePublic } from '@/lib/api';

function PackageCard({ pkg }: { pkg: TourPackagePublic }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/tours/packages/${encodeURIComponent(pkg.slug)}`}>
        <div className="relative aspect-square overflow-hidden">
          {pkg.image_url ? (
            <Image
              src={pkg.image_url}
              alt={pkg.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center">
              <Package className="w-12 h-12 text-blue-300" />
            </div>
          )}
          {pkg.countries.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
                <Globe className="w-3 h-3" />
                {pkg.countries.length} ประเทศ
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/tours/packages/${encodeURIComponent(pkg.slug)}`}>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {pkg.name}
          </h3>
        </Link>
        {pkg.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pkg.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')}</p>
        )}
        {pkg.countries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {pkg.countries.map((country) => (
                <span
                  key={country.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
                >
                  {country.iso2 && (
                    <img
                      src={`https://flagcdn.com/16x12/${country.iso2}.png`}
                      alt=""
                      className="w-4 h-3 object-cover rounded-[2px]"
                    />
                  )}
                  <span className="font-medium">{country.name_th}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {pkg.hashtags && pkg.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {pkg.hashtags.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-100"
              >
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {pkg.hashtags.length > 5 && (
              <span className="text-xs text-gray-400">+{pkg.hashtags.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TourPackagesPage() {
  const [packages, setPackages] = useState<TourPackagePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState<{
    cover_image_url: string | null;
    cover_image_position: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, settingsRes] = await Promise.all([
          tourPackagesApi.list(),
          tourPackagesApi.pageSettings(),
        ]);
        if (packagesRes?.data) setPackages(packagesRes.data);
        if (settingsRes?.cover_image_url !== undefined) setPageSettings(settingsRes);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 bg-gray-300 animate-pulse" />
        ) : pageSettings?.cover_image_url ? (
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
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
        )}
        <div className="container-custom relative z-10 pt-8 pb-12 lg:pt-12 lg:pb-16">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-3xl">📦</span>
            <h1 className="text-3xl lg:text-4xl font-bold">แพ็คเกจทัวร์</h1>
          </div>
          <p className="text-white/80 text-base lg:text-lg ml-8">
            รวมแพ็คเกจทัวร์พิเศษ พร้อมรายละเอียดครบครัน เลือกแพ็คเกจที่ใช่สำหรับคุณ
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ยังไม่มีแพ็คเกจทัวร์ที่เปิดให้บริการ
            </h3>
            <p className="text-gray-500">กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-base text-gray-600">
                <strong className="text-gray-900">{packages.length}</strong>{' '}
                แพ็คเกจ
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
