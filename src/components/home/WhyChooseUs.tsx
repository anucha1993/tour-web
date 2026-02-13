'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  CreditCard,
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Heart,
  Award,
  CheckCircle,
  Globe,
  Plane,
  Users,
  Zap,
  ThumbsUp,
  Sparkles,
  Crown,
  Target,
  TrendingUp,
  Briefcase,
  Gift,
} from 'lucide-react';
import { API_URL } from '@/lib/config';

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, CreditCard, Headphones, Phone, Mail, MapPin, Clock, Star, Heart,
  Award, CheckCircle, Globe, Plane, Users, Zap, ThumbsUp, Sparkles, Crown,
  Target, TrendingUp, Briefcase, Gift,
};

interface WhyChooseUsItem {
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseUsConfig {
  title: string;
  subtitle: string;
  show: boolean;
  items: WhyChooseUsItem[];
}

const defaultConfig: WhyChooseUsConfig = {
  title: 'ทำไมต้องเลือกเรา?',
  subtitle: 'NextTrip พร้อมให้บริการคุณด้วยมาตรฐานสูงสุด',
  show: true,
  items: [
    { icon: 'Shield', title: 'ใบอนุญาตถูกต้อง', description: 'ได้รับใบอนุญาตจาก ททท. และ กรมการท่องเที่ยว' },
    { icon: 'Award', title: 'ประสบการณ์กว่า 10 ปี', description: 'ทีมงานมืออาชีพพร้อมดูแลตลอดการเดินทาง' },
    { icon: 'Clock', title: 'บริการ 24 ชั่วโมง', description: 'ติดต่อเราได้ตลอดเวลาทั้งก่อนและระหว่างเดินทาง' },
    { icon: 'Plane', title: 'สายการบินชั้นนำ', description: 'ร่วมกับสายการบินชั้นนำระดับโลก' },
  ],
};

// Skeleton
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm animate-pulse">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-200" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3" />
      <div className="h-3 bg-gray-100 rounded w-5/6 mx-auto" />
    </div>
  );
}

export default function WhyChooseUs() {
  const [config, setConfig] = useState<WhyChooseUsConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/why-choose-us/public`);
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch why choose us config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // If API returns null (hidden), don't render
  if (!isLoading && !config.show) return null;

  return (
    <section className="py-16 lg:py-20 bg-[var(--color-primary-50)]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-gray-800)]">
            {config.title}
          </h2>
          <p className="text-[var(--color-gray-500)] mt-2">
            {config.subtitle}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Items */}
        {!isLoading && config.items.length > 0 && (
          <div className={`grid gap-6 ${
            config.items.length <= 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {config.items.map((item, index) => {
              const IconComponent = ICON_MAP[item.icon] || Shield;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-gray-800)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-gray-500)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
