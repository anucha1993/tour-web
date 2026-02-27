"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { notificationApi } from "@/lib/api";
import {
  HeartIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  DocumentCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  TrophyIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isMockup?: boolean;
  badgeKey?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "การจองทัวร์",
    items: [
      { href: "/member/wishlist", icon: HeartIcon, label: "ทัวร์ที่ถูกใจ"},
      { href: "/member/bookings", icon: ClipboardDocumentListIcon, label: "รายการจอง"},
      { href: "/member/quotations", icon: DocumentTextIcon, label: "ใบเสนอราคา", isMockup: true },
      { href: "/member/payment-history", icon: BanknotesIcon, label: "ประวัติการชำระเงิน", isMockup: true },
      { href: "/member/reviews", icon: StarIcon, label: "รีวิวของฉัน" },
      { href: "/member/points", icon: TrophyIcon, label: "คะแนนสะสม" },
      { href: "/member/notifications", icon: BellIcon, label: "โปรโมชั่นสำหรับคุณ", badgeKey: "notifications" },
    ],
  },
  {
    title: "ตั้งค่าบัญชี",
    items: [
      { href: "/member/profile", icon: UserIcon, label: "ข้อมูลส่วนตัว" },
      { href: "/member/billing-address", icon: MapPinIcon, label: "ที่อยู่ใบกำกับภาษี" },
    ],
  },
  {
    title: "อื่นๆ",
    items: [
      { href: "/member/terms", icon: DocumentCheckIcon, label: "เงื่อนไขการให้บริการ" },
      { href: "/member/payment-terms", icon: CreditCardIcon, label: "เงื่อนไขชำระเงิน" },
      { href: "/member/payment-channels", icon: CreditCardIcon, label: "ช่องทางการชำระเงิน" },
      { href: "/member/cookie-policy", icon: ShieldCheckIcon, label: "นโยบายคุกกี้" },
      { href: "/member/privacy-policy", icon: ShieldCheckIcon, label: "นโยบายความเป็นส่วนตัว" },
    ],
  },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { member, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadNotifications(res.count ?? 0);
    } catch {
      // silently ignore
    }
  }, []);

  const badges: Record<string, number> = { notifications: unreadNotifications };

  useEffect(() => {
    if (!isLoading && !member) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [member, isLoading, router, pathname]);

  useEffect(() => {
    if (member) {
      fetchUnreadCount();
    }
  }, [member, fetchUnreadCount]);

  // refresh count when landing on the notifications page
  useEffect(() => {
    if (pathname === "/member/notifications" && member) {
      const timer = setTimeout(() => fetchUnreadCount(), 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname, member, fetchUnreadCount]);

  // listen for badge updates from notifications page and detail page
  useEffect(() => {
    const onChanged = (e: Event) => {
      const count = (e as CustomEvent<{ count: number }>).detail?.count;
      if (typeof count === 'number') setUnreadNotifications(count);
    };
    const onRefresh = () => fetchUnreadCount();
    window.addEventListener('notification-count-changed', onChanged);
    window.addEventListener('notification-count-changed-refresh', onRefresh);
    return () => {
      window.removeEventListener('notification-count-changed', onChanged);
      window.removeEventListener('notification-count-changed-refresh', onRefresh);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-custom flex items-center justify-between py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-gray-900">บัญชีของฉัน</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="container-custom">
        <div className="flex gap-6 py-6">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:relative top-0 left-0 z-50 lg:z-0
              w-80 h-screen lg:h-auto
              bg-white border-r lg:border border-gray-200 lg:rounded-xl lg:shadow-sm
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              lg:flex-shrink-0 lg:self-start lg:sticky lg:top-6
            `}
          >
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-semibold text-gray-900">เมนู</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-orange-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {member.first_name || "สมาชิก"} {member.last_name || ""}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-gray-500 truncate">{member.phone}</p>
                </div>
                {member.level && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span>{member.level.icon || '🏅'}</span>
                      {member.level.name}
                    </span>
                    {typeof member.total_points === 'number' && (
                      <span className="text-xs text-gray-400">
                        {member.total_points.toLocaleString()} pts
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Groups */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${
                            isActive(item.href)
                              ? "bg-orange-50 text-[var(--color-primary)]"
                              : "text-gray-700 hover:bg-gray-100"
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.isMockup && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            Mockup
                          </span>
                        )}
                        {item.badgeKey && (badges[item.badgeKey] ?? 0) > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold bg-orange-500 text-white">
                            {(badges[item.badgeKey] ?? 0) > 99 ? '99+' : badges[item.badgeKey]}
                          </span>
                        )}
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Logout */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {children}
        </main>
        </div>
      </div>
    </div>
  );
}
