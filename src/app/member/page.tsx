"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { 
  HeartIcon, 
  UserIcon, 
  KeyIcon, 
  ArrowRightOnRectangleIcon,
  ClockIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

export default function MemberDashboard() {
  const router = useRouter();
  const { member, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !member) {
      router.push("/login");
    }
  }, [member, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  const menuItems = [
    {
      href: "/member/profile",
      icon: UserIcon,
      title: "ข้อมูลส่วนตัว",
      description: "แก้ไขข้อมูลส่วนตัว อีเมล และที่อยู่",
      color: "bg-blue-500",
    },
    {
      href: "/member/wishlist",
      icon: HeartIcon,
      title: "ทัวร์ที่ชอบ",
      description: "รายการทัวร์ที่คุณบันทึกไว้",
      color: "bg-red-500",
    },
    {
      href: "/member/bookings",
      icon: TicketIcon,
      title: "ประวัติการจอง",
      description: "ดูรายการจองทัวร์ทั้งหมด",
      color: "bg-green-500",
    },
    {
      href: "/member/change-password",
      icon: KeyIcon,
      title: "เปลี่ยนรหัสผ่าน",
      description: "เปลี่ยนรหัสผ่านเพื่อความปลอดภัย",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  สวัสดี, {member.first_name || "สมาชิก"}!
                </h1>
                <p className="text-orange-100 text-sm md:text-base">
                  {member.phone}
                </p>
                {member.email && (
                  <p className="text-orange-100 text-sm">
                    {member.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-100 text-sm">
              <ClockIcon className="w-4 h-4" />
              <span>
                สมาชิกตั้งแต่ {new Date(member.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className={`${item.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
