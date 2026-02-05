"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi } from "@/lib/api";
import { 
  HeartIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface WishlistItem {
  id: number;
  tour_id: number;
  tour?: {
    id: number;
    name: string;
    slug?: string;
    thumbnail?: string;
    price?: number;
    duration?: string;
    destination?: string;
  };
  created_at: string;
}

export default function MemberWishlist() {
  const router = useRouter();
  const { member, isLoading: authLoading } = useAuth();
  
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !member) {
      router.push("/login");
    }
  }, [member, authLoading, router]);

  useEffect(() => {
    if (member) {
      fetchWishlists();
    }
  }, [member]);

  const fetchWishlists = async () => {
    try {
      const response = await wishlistApi.getAll();
      if (response.success) {
        setWishlists((response as { data?: WishlistItem[] }).data || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (tourId: number) => {
    setRemovingId(tourId);
    try {
      await wishlistApi.toggle(tourId);
      setWishlists((prev) => prev.filter((item) => item.tour_id !== tourId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/member"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ทัวร์ที่ชอบ</h1>
            <p className="text-sm text-gray-500">{wishlists.length} รายการ</p>
          </div>
        </div>

        {/* Wishlist Grid */}
        {wishlists.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีรายการที่ชอบ</h3>
            <p className="text-gray-500 mb-6">กดไอคอนหัวใจเพื่อบันทึกทัวร์ที่คุณสนใจ</p>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              ค้นหาทัวร์
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-200">
                  {item.tour?.thumbnail ? (
                    <Image
                      src={item.tour.thumbnail}
                      alt={item.tour?.name || "Tour"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                      <MapPinIcon className="w-12 h-12 text-orange-400" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.tour_id)}
                    disabled={removingId === item.tour_id}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group/btn"
                  >
                    {removingId === item.tour_id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HeartSolidIcon className="w-5 h-5 text-red-500 group-hover/btn:scale-110 transition-transform" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {item.tour?.name || `ทัวร์ #${item.tour_id}`}
                  </h3>
                  
                  {item.tour?.destination && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{item.tour.destination}</span>
                    </div>
                  )}
                  
                  {item.tour?.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{item.tour.duration}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {item.tour?.price ? (
                      <div>
                        <span className="text-sm text-gray-500">เริ่มต้น</span>
                        <p className="text-lg font-bold text-orange-600">
                          ฿{item.tour.price.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">ไม่ระบุราคา</div>
                    )}
                    
                    <Link
                      href={`/tours/${item.tour?.slug || item.tour_id}`}
                      className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
