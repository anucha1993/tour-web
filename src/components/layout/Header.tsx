'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Phone, Search, Clock, MessageCircle, Facebook, Instagram, Youtube, Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Navigation menu items
const menuItems = [
  { 
    label: 'หน้าหลัก', 
    href: '/' 
  },
  { 
    label: 'ทัวร์ต่างประเทศ', 
    href: '/tours/international',
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
      { label: 'ทัวร์ภาคเหนือ', href: '/tours/domestic/north' },
      { label: 'ทัวร์ภาคใต้', href: '/tours/domestic/south' },
      { label: 'ทัวร์ภาคอีสาน', href: '/tours/domestic/northeast' },
      { label: 'ทัวร์ภาคกลาง', href: '/tours/domestic/central' },
      { label: 'ดูทั้งหมด', href: '/tours/domestic' },
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
      { label: 'ทัวร์ปีใหม่', href: '/tours/festival/new-year' },
      { label: 'ทัวร์สงกรานต์', href: '/tours/festival/songkran' },
      { label: 'ทัวร์วันหยุดยาว', href: '/tours/festival/long-weekend' },
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
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { member, isLoading: authLoading, logout } = useAuth();

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
          {/* Left - Contact info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>สอบถามทัวร์:</span>
              <a href="tel:021369144" className="font-semibold hover:text-blue-200 transition-colors">
                02-136-9144
              </a>
            </div>
            <span className="text-orange-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">HOTLINE</span>
              <a href="tel:0910916364" className="font-semibold hover:text-blue-200 transition-colors">
                091-091-6364
              </a>
              <span className="text-orange-200 text-xs">(ตลอดเวลา)</span>
            </div>
            <span className="text-orange-200">|</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>เปิดทุกวัน 08.00-23.00 น.</span>
            </div>
            <span className="text-orange-200">|</span>
            <a 
              href="https://line.me/R/ti/p/@nexttripholiday" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>LINE: @nexttripholiday</span>
            </a>
          </div>
          
          {/* Right - Social links */}
          <div className="flex items-center gap-3">
            <span className="text-orange-200 text-xs">ติดตามเรา:</span>
            <div className="flex items-center gap-2">
              <a 
                href="https://facebook.com/nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com/@nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://tiktok.com/@nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
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
            {menuItems.map((item) => (
              <div 
                key={item.href}
                className="relative group"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.href)}
                onMouseLeave={() => setActiveSubmenu(null)}
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
                  {item.submenu && (
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeSubmenu === item.href ? 'rotate-180' : ''
                    }`} />
                  )}
                </Link>

                {/* Dropdown submenu */}
                {item.submenu && activeSubmenu === item.href && (
                  <div className="absolute top-full left-0 pt-2 animate-slide-down">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-4 py-2.5 text-sm text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
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
              className="hidden lg:flex p-2.5 rounded-lg text-[var(--color-gray-500)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
              aria-label="ค้นหาทัวร์"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist button */}
            <Link 
              href="/member/wishlist"
              className="relative p-2 lg:p-2.5 rounded-lg text-[var(--color-gray-500)] hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="ทัวร์ที่ชอบ"
            >
              <Heart className="w-5 h-5 lg:w-5 lg:h-5" />
              {/* Badge - จำนวนทัวร์ในรายการโปรด */}
              <span className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                0
              </span>
            </Link>

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
                      <Link
                        href="/member/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        ทัวร์ที่ชอบ
                      </Link>
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

      {/* Mobile Menu */}
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
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleMobileSubmenu(item.href)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[var(--color-gray-700)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] font-medium transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileSubmenu === item.href ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Mobile submenu - collapsible */}
                      <div className={`overflow-hidden transition-all duration-300 ${mobileSubmenu === item.href ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 py-2 space-y-1 border-l-2 border-[var(--color-primary-100)]">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-4 py-2.5 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-primary)] transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
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
              
              <Link
                href="/tours"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>ค้นหาทัวร์</span>
              </Link>
              
              {/* Contact info */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2 text-[var(--color-gray-600)]">
                  <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>สอบถามทัวร์:</span>
                  <a href="tel:021369144" className="font-semibold text-[var(--color-primary)]">
                    02-136-9144
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 text-[var(--color-gray-600)]">
                  <span className="bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded text-xs font-bold">HOTLINE</span>
                  <a href="tel:0910916364" className="font-semibold text-[var(--color-primary)]">
                    091-091-6364
                  </a>
                  <span className="text-xs text-[var(--color-gray-400)]">(ตลอดเวลา)</span>
                </div>
                <a 
                  href="https://line.me/R/ti/p/@nexttripholiday"
                  className="flex items-center justify-center gap-2 text-[var(--color-gray-600)] hover:text-[var(--color-primary)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>LINE: @nexttripholiday</span>
                </a>
              </div>

              {/* Social links */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <a href="https://facebook.com/nexttripholiday" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/nexttripholiday" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://youtube.com/@nexttripholiday" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://tiktok.com/@nexttripholiday" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gray-400)] hover:text-[var(--color-primary)]">
                  <TikTokIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
