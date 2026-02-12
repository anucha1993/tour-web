'use client';

import { useTourBadges } from '@/contexts/TourBadgesContext';

const BADGE_BG_CLASSES: Record<string, string> = {
  red: 'bg-gradient-to-r from-red-600 to-orange-500',
  orange: 'bg-gradient-to-r from-orange-500 to-yellow-400',
  yellow: 'bg-gradient-to-r from-amber-400 to-yellow-300 !text-yellow-900',
  green: 'bg-gradient-to-r from-green-500 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-400',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-400',
};

interface TourTabBadgesProps {
  tourId: number;
  className?: string;
}

/**
 * แสดง badges จาก TourTab ที่ตั้งค่าเป็น display_mode = badge หรือ both
 * ใช้ได้ทุกหน้าเว็บ ดึงข้อมูลจาก TourBadgesContext
 */
export default function TourTabBadges({ tourId, className = '' }: TourTabBadgesProps) {
  const { getBadges } = useTourBadges();
  const badges = getBadges(tourId);

  if (badges.length === 0) return null;

  return (
    <>
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
            BADGE_BG_CLASSES[badge.color] || 'bg-gray-500'
          } ${badge.color === 'yellow' ? 'text-yellow-900' : ''} ${className}`}
        >
          {badge.icon && <span>{badge.icon}</span>}
          {badge.text}
        </span>
      ))}
    </>
  );
}
