'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Phone, Search, Clock, MessageCircle, Facebook, Instagram, Youtube, Heart, User, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { API_URL } from '@/lib/config';

// Lazy load SearchOverlay - only loaded when user opens search
const SearchOverlay = dynamic(() => import('@/components/shared/SearchOverlay'), { ssr: false });

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface NavMenuItem {
  label: string;
  href: string;
  megaMenu?: boolean; // flag for mega menu items (international tours)
  submenu?: { label: string; href: string }[];
}

interface IntlCity {
  id: number;
  name_th: string;
  slug: string;
  tour_count: number;
}

interface DomesticCity {
  id: number;
  name_th: string;
  name_en: string;
  slug: string;
  tour_count: number;
}

interface IntlCountry {
  id: number;
  name_th: string;
  slug: string;
  iso2: string;
  flag_emoji: string;
  tour_count: number;
  cities: IntlCity[];
}

// Type alias - API now returns flat country list
type IntlMenuData = IntlCountry[];

// Fallback navigation menu items
const fallbackMenuItems: NavMenuItem[] = [
  { 
    label: 'หน้าหลัก', 
    href: '/' 
  },
  { 
    label: 'ทัวร์ต่างประเทศ', 
    href: '/tours/international',
    megaMenu: true,
    submenu: [
      { label: 'ทัวร์ยุโรป', href: '/tours/europe' },
      { label: 'ทัวร์ญี่ปุ่น', href: '/tours/japan' },
      { label: 'ทัวร์เกาหลี', href: '/tours/korea' },
      { label: 'ทัวร์จีน', href: '/tours/china' },
      { label: 'ทัวร์ไต้หวัน', href: '/tours/taiwan' },
      { label: 'ทัวร์เวียดนาม', href: '/tours/vietnam' },
      { label: 'ทัวร์สิงคโปร์', href: '/tours/singapore' },
      { label: 'ทัวร์ฮ่องกง', href: '/tours/hongkong' },
      { label: 'ดูทั้งหมด', href: '/tours/international' },
    ]
  },
  { 
    label: 'ทัวร์ในประเทศ', 
    href: '/tours/domestic',
    submenu: [
      { label: 'ดูทัวร์ในประเทศทั้งหมด', href: '/tours/domestic' },
    ]
  },
  { 
    label: 'ทัวร์โปรโมชั่น', 
    href: '/promotions' 
  },
  { 
    label: 'ทัวร์ตามเทศกาล', 
    href: '/tours/festival',
    submenu: [
      { label: 'ดูทั้งหมด', href: '/tours/festival' },
    ]
  },
  { 
    label: 'แพ็คเกจทัวร์', 
    href: '/packages' 
  },
  { 
    label: 'รับจัดกรุ๊ปทัวร์', 
    href: '/group-tours' 
  },
  { 
    label: 'รอบรู้เรื่องเที่ยว', 
    href: '/blog' 
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuItems, setMenuItems] = useState<NavMenuItem[]>(fallbackMenuItems);
  const [intlCountries, setIntlCountries] = useState<IntlMenuData>([]);
  const [domesticCities, setDomesticCities] = useState<DomesticCity[]>([]);
  const [festivalMenuItems, setFestivalMenuItems] = useState<{ label: string; href: string }[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [contactPhone, setContactPhone] = useState({ label: 'สอบถามทัวร์', value: '02-136-9144', url: 'tel:021369144' });
  const [contactHotline, setContactHotline] = useState({ label: 'Hotline (ตลอดเวลา)', value: '091-091-6364', url: 'tel:0910916364' });
  const [contactLine, setContactLine] = useState({ label: 'LINE', value: '@nexttripholiday', url: 'https://line.me/R/ti/p/@nexttripholiday' });
  const [contactHours, setContactHours] = useState('เปิดทุกวัน 08.00-23.00 น.');
  const [socialUrls, setSocialUrls] = useState({ facebook: 'https://facebook.com/nexttripholiday', instagram: 'https://instagram.com/nexttripholiday', youtube: 'https://youtube.com/@nexttripholiday', tiktok: 'https://tiktok.com/@nexttripholiday' });
  
  const { member, isLoading: authLoading, logout } = useAuth();
  const { count: favoritesCount, openDrawer: openFavoritesDrawer } = useFavorites();

  // Submenu hover helpers - delay closing so mouse can travel from nav to mega menu panel
  const openSubmenu = useCallback((href: string) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
      submenuTimeoutRef.current = null;
    }
    setActiveSubmenu(href);
  }, []);

  const closeSubmenuDelayed = useCallback(() => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 200);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    };
  }, []);

  // Fetch header menus + contacts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, contactsRes, intlMenuRes, domesticMenuRes, festivalMenuRes] = await Promise.all([
          fetch(`${API_URL}/menus/public`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/site-contacts/public`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/tours/international-menu`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/tours/domestic-menu`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/tours/festival`).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (intlMenuRes?.success && Array.isArray(intlMenuRes.data)) {
          setIntlCountries(intlMenuRes.data);
        }

        // Build domestic submenu from real city data
        if (domesticMenuRes?.success && Array.isArray(domesticMenuRes.data)) {
          setDomesticCities(domesticMenuRes.data);
        }

        // Build festival submenu from API data
        let festivalSubs: { label: string; href: string }[] = [];
        if (festivalMenuRes?.data && Array.isArray(festivalMenuRes.data)) {
          festivalSubs = festivalMenuRes.data.map((f: { name: string; slug: string; badge_icon?: string | null }) => ({
            label: `${f.badge_icon ? f.badge_icon + ' ' : ''}${f.name}`,
            href: `/tours/festival/${f.slug}`,
          }));
          festivalSubs.push({ label: 'ดูทั้งหมด', href: '/tours/festival' });
          setFestivalMenuItems(festivalSubs);
        }

        if (menusRes?.success && menusRes.data?.header) {
          const apiMenus: NavMenuItem[] = menusRes.data.header.map((item: { title: string; url: string; children?: { title: string; url: string }[] }) => {
            const href = item.url || '#';
            const isDomestic = href.includes('domestic');
            const isFestival = href.includes('festival');
            return {
              label: item.title,
              href,
              megaMenu: href.includes('international'),
              // For domestic menu, use a minimal placeholder submenu so the dropdown arrow shows
              // The actual rendering will use domesticCities data
              // For festival menu, use dynamically fetched festival list
              submenu: isDomestic
                ? [{ label: 'ดูทัวร์ในประเทศทั้งหมด', href: '/tours/domestic' }]
                : isFestival && festivalSubs.length > 0
                  ? festivalSubs
                  : (item.children && item.children.length > 0
                      ? item.children.map((child: { title: string; url: string }) => ({
                          label: child.title,
                          href: child.url || '#',
                        }))
                      : undefined),
            };
          });
          if (apiMenus.length > 0) setMenuItems(apiMenus);
        }

        if (contactsRes?.success && contactsRes.data) {
          const ct = contactsRes.data.contact || [];
          const sc = contactsRes.data.social || [];
          const bh = contactsRes.data.business_hours || [];
          const find = (arr: { key: string; label: string; value: string; url?: string }[], key: string) => arr.find((i: { key: string }) => i.key === key);

          const phone = find(ct, 'phone');
          if (phone) setContactPhone({ label: phone.label, value: phone.value, url: phone.url || `tel:${phone.value.replace(/[^0-9]/g, '')}` });
          const hotline = find(ct, 'hotline');
          if (hotline) setContactHotline({ label: hotline.label, value: hotline.value, url: hotline.url || `tel:${hotline.value.replace(/[^0-9]/g, '')}` });
          const line = find(ct, 'line_id');
          if (line) setContactLine({ label: 'LINE', value: line.value, url: line.url || '#' });
          if (bh.length > 0) setContactHours(bh[0].value);

          const fb = find(sc, 'facebook');
          const ig = find(sc, 'instagram');
          const yt = find(sc, 'youtube');
          const tt = find(sc, 'tiktok');
          setSocialUrls(prev => ({
            facebook: fb?.url || prev.facebook,
            instagram: ig?.url || prev.instagram,
            youtube: yt?.url || prev.youtube,
            tiktok: tt?.url || prev.tiktok,
          }));
        }
      } catch {
        // Use fallback data
      } finally {
        setDataLoaded(true);
      }
    };
    fetchData();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change and prevent body scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Toggle mobile submenu
  const toggleMobileSubmenu = (href: string) => {
    setMobileSubmenu(mobileSubmenu === href ? null : href);
  };

  return (
    <>
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      {/* Top bar - Contact info */}
      <div className="hidden lg:block bg-[var(--color-primary)] text-white text-sm">
        <div className="container-custom flex justify-between items-center py-2.5">
          {!dataLoaded ? (
            /* Skeleton for top bar */
            <>
              <div className="flex items-center gap-4">
                <div className="h-4 w-28 bg-white/20 rounded animate-pulse" />
                <span className="text-white/20">|</span>
                <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                <span className="text-white/20">|</span>
                <div className="h-4 w-40 bg-white/20 rounded animate-pulse" />
                <span className="text-white/20">|</span>
                <div className="h-4 w-36 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-white/20 rounded animate-pulse" />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Left - Contact info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{contactPhone.label}:</span>
                  <a href={contactPhone.url} className="font-semibold hover:text-blue-200 transition-colors">
                    {contactPhone.value}
                  </a>
                </div>
                <span className="text-orange-200">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">HOTLINE</span>
                  <a href={contactHotline.url} className="font-semibold hover:text-blue-200 transition-colors">
                    {contactHotline.value}
                  </a>
                  <span className="text-orange-200 text-xs">(ตลอดเวลา)</span>
                </div>
                <span className="text-orange-200">|</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{contactHours}</span>
                </div>
                <span className="text-orange-200">|</span>
                <a 
                  href={contactLine.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>LINE: {contactLine.value}</span>
                </a>
              </div>
              
              {/* Right - Social links */}
              <div className="flex items-center gap-3">
                <span className="text-orange-200 text-xs">ติดตามเรา:</span>
                <div className="flex items-center gap-2">
                  <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors" aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors" aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href={socialUrls.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors" aria-label="YouTube">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href={socialUrls.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors" aria-label="TikTok">
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="NextTrip Holiday Logo"
              width={180}
              height={50}
              className="h-10 lg:h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0">
            {!dataLoaded ? (
              /* Skeleton for nav */
              <div className="flex items-center gap-2">
                {[72, 88, 65, 78, 84, 92, 68, 80].map((w, i) => (
                  <div key={i} className="h-5 rounded bg-gray-200 animate-pulse" style={{ width: `${w}px` }} />
                ))}
              </div>
            ) : null}
            {dataLoaded && menuItems.map((item) => (
              <div 
                key={item.href}
                className="relative group"
                onMouseEnter={() => (item.submenu || item.megaMenu) && openSubmenu(item.href)}
                onMouseLeave={() => closeSubmenuDelayed()}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                    transition-colors duration-200
                    text-[var(--color-gray-700)] hover:text-[var(--color-primary)]
                    hover:bg-[var(--color-primary-50)]
                  `}
                >
                  {item.label}
                  {(item.submenu || item.megaMenu) && (
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeSubmenu === item.href ? 'rotate-180' : ''
                    }`} />
                  )}
                </Link>

                {/* Regular dropdown submenu (non-mega) */}
                {item.submenu && !item.megaMenu && activeSubmenu === item.href && (
                  <div className="absolute top-full left-0 pt-2 animate-slide-down z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px]">
                      {/* Domestic tours: show dynamic cities with tour counts */}
                      {item.href === '/tours/domestic' && domesticCities.length > 0 ? (
                        <>
                          {domesticCities.map((city) => (
                            <Link
                              key={city.id}
                              href={`/tours/domestic?city_id=${city.id}`}
                              className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {city.name_th}
                              </span>
                              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{city.tour_count}</span>
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <Link
                              href="/tours/domestic"
                              className="block px-4 py-2.5 text-sm text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary-50)] transition-colors"
                            >
                              ดูทั้งหมด →
                            </Link>
                          </div>
                        </>
                      ) : (
                        item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-4 py-2.5 text-sm text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Search & Wishlist */}
          <div className="flex items-center gap-1 lg:gap-3">
            {/* Search button - hidden on mobile */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex p-2.5 rounded-lg text-[var(--color-gray-500)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
              aria-label="ค้นหาทัวร์"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist button */}
            <button 
              onClick={openFavoritesDrawer}
              className="relative p-2 lg:p-2.5 rounded-lg text-[var(--color-gray-500)] hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="ทัวร์ที่ชอบ"
            >
              <Heart className="w-5 h-5 lg:w-5 lg:h-5" />
              {/* Badge - จำนวนทัวร์ในรายการโปรด */}
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </button>

            {/* User/Login button */}
            {!authLoading && (
              member ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 lg:px-3 lg:py-2 rounded-lg text-[var(--color-gray-700)] hover:bg-[var(--color-primary-50)] transition-colors"
                  >
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {member.first_name?.[0] || 'U'}
                    </div>
                    <span className="hidden lg:block text-sm font-medium">
                      {member.first_name || 'สมาชิก'}
                    </span>
                    <ChevronDown className={`hidden lg:block w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px] z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-gray-500">{member.phone}</p>
                      </div>
                      <Link
                        href="/member"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        หน้าสมาชิก
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openFavoritesDrawer();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        ทัวร์ที่ชอบ
                        {favoritesCount > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {favoritesCount}
                          </span>
                        )}
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors text-sm font-medium"
                >
                  <User className="w-6 h-4" />
                  Login
                </Link>
              )
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden p-2.5 rounded-lg text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] transition-colors"
              aria-label={isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu for international tours - rendered at header level for proper centering */}
      {activeSubmenu && menuItems.some(m => m.megaMenu && m.href === activeSubmenu) && (
        <div
          className="hidden lg:block absolute left-0 right-0 z-50 animate-slide-down pointer-events-none"
        >
          <div className="container-custom">
            <div 
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 max-h-[75vh] overflow-y-auto pointer-events-auto"
              onMouseEnter={() => openSubmenu(activeSubmenu!)}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">🌏 ทัวร์ต่างประเทศ</h3>
                <Link href="/tours/international" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                  ดูทั้งหมด →
                </Link>
              </div>
              {/* Skeleton loading */}
              {intlCountries.length === 0 ? (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}px` }} />
                        <div className="h-4 w-6 bg-gray-100 rounded-full animate-pulse ml-auto" />
                      </div>
                      <div className="flex flex-wrap gap-1 pl-7">
                        {Array.from({ length: (i % 3) + 1 }).map((_, j) => (
                          <div key={j} className="h-5 bg-orange-50 border border-orange-200 rounded-full animate-pulse" style={{ width: `${45 + (j % 2) * 20}px` }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-2">
                  {intlCountries.map((country) => (
                    <div key={country.id}>
                      <Link
                        href={`/tours/country/${country.slug}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-primary-50)] transition-colors group/country"
                      >
                        {country.iso2 && <img src={`https://flagcdn.com/20x15/${country.iso2}.png`} width={20} height={15} alt={country.name_th} className="inline-block shrink-0" />}
                        <span className="text-base text-gray-700 group-hover/country:text-[var(--color-primary)] font-medium truncate">
                          {country.name_th}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 ml-auto shrink-0">
                          {country.tour_count}
                        </span>
                      </Link>
                      {/* City badges - orange border */}
                      {country.cities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5 pl-7">
                          {country.cities.map((city) => (
                            <Link
                              key={city.id}
                              href={`/tours/city/${city.slug}`}
                              className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-400 rounded-full px-2 py-0.5 transition-colors"
                            >
                              <MapPin className="w-3 h-3" />
                              {city.name_th}
                              <span className="text-orange-400">{city.tour_count}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </header>

      {/* Mobile Menu - outside header for proper z-index stacking */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
          {/* Mobile header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Image
                src="/logo.svg"
                alt="NextTrip Holiday Logo"
                width={120}
                height={35}
                className="h-10 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] transition-colors"
              aria-label="ปิดเมนู"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="container-custom py-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.href}>
                  {/* Mega menu (international tours) for mobile */}
                  {item.megaMenu ? (
                    <>
                      <button
                        onClick={() => toggleMobileSubmenu(item.href)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] font-medium transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileSubmenu === item.href ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${mobileSubmenu === item.href ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-2 py-2 space-y-1">
                          {/* Skeleton loading for mobile */}
                          {intlCountries.length === 0 ? (
                            <div className="space-y-3 px-3">
                              {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}px` }} />
                                  </div>
                                  <div className="flex flex-wrap gap-1 pl-7">
                                    {Array.from({ length: (i % 2) + 1 }).map((_, j) => (
                                      <div key={j} className="h-5 bg-orange-50 border border-orange-200 rounded-full animate-pulse" style={{ width: `${45 + (j % 2) * 15}px` }} />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Countries flat list */
                            <>
                              {intlCountries.map((country) => (
                                <div key={country.id}>
                                  <Link
                                    href={`/tours/country/${country.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                                  >
                                    {country.iso2 && <img src={`https://flagcdn.com/20x15/${country.iso2}.png`} width={20} height={15} alt={country.name_th} className="inline-block shrink-0" />}
                                    <span>{country.name_th}</span>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">{country.tour_count}</span>
                                  </Link>
                                  {/* City badges - orange border */}
                                  {country.cities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 ml-10 mb-1">
                                      {country.cities.map((city) => (
                                        <Link
                                          key={city.id}
                                          href={`/tours/city/${city.slug}`}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="inline-flex items-center gap-1 text-[11px] text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-400 rounded-full px-2 py-0.5 transition-colors"
                                        >
                                          <MapPin className="w-2.5 h-2.5" />
                                          {city.name_th}
                                          <span className="text-orange-400">{city.tour_count}</span>
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Link
                                href="/tours/international"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-[var(--color-primary)] font-medium hover:underline"
                              >
                                ดูทัวร์ต่างประเทศทั้งหมด →
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleMobileSubmenu(item.href)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] font-medium transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileSubmenu === item.href ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Mobile submenu - collapsible */}
                      <div className={`overflow-hidden transition-all duration-300 ${mobileSubmenu === item.href ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 py-2 space-y-1 border-l-2 border-[var(--color-primary-100)]">
                          {/* Domestic tours: show dynamic cities with tour counts */}
                          {item.href === '/tours/domestic' && domesticCities.length > 0 ? (
                            <>
                              {domesticCities.map((city) => (
                                <Link
                                  key={city.id}
                                  href={`/tours/domestic?city_id=${city.id}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-primary)] transition-colors"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    {city.name_th}
                                  </span>
                                  <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">{city.tour_count}</span>
                                </Link>
                              ))}
                              <Link
                                href="/tours/domestic"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm text-[var(--color-primary)] font-medium hover:underline"
                              >
                                ดูทั้งหมด →
                              </Link>
                            </>
                          ) : (
                            item.submenu.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-primary)] transition-colors"
                              >
                                {subItem.label}
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {/* Login/Member area for mobile */}
              {!authLoading && (
                member ? (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {member.first_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-gray-500">{member.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/member"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-2 text-center text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-50)] transition-colors"
                      >
                        หน้าสมาชิก
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="py-2 px-4 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        ออก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-600)] transition-colors"
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-50)] transition-colors"
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                )
              )}
              
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>ค้นหาทัวร์</span>
              </button>
              
              {/* Contact info */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2 text-[var(--color-gray-600)]">
                  <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{contactPhone.label}:</span>
                  <a href={contactPhone.url} className="font-semibold text-[var(--color-primary)]">
                    {contactPhone.value}
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 text-[var(--color-gray-600)]">
                  <span className="bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded text-xs font-bold">HOTLINE</span>
                  <a href={contactHotline.url} className="font-semibold text-[var(--color-primary)]">
                    {contactHotline.value}
                  </a>
                  <span className="text-xs text-[var(--color-gray-400)]">(ตลอดเวลา)</span>
                </div>
                <a 
                  href={contactLine.url}
                  className="flex items-center justify-center gap-2 text-[var(--color-gray-600)] hover:text-[var(--color-primary)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>LINE: {contactLine.value}</span>
                </a>
              </div>

              {/* Social links */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={socialUrls.youtube} target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href={socialUrls.tiktok} target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <TikTokIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}

    {/* Search Overlay - only mount when needed */}
    {isSearchOpen && <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
