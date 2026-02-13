'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube,
  Clock,
  Shield,
  CreditCard,
  Headphones,
  MessageCircle,
  AlertTriangle,
  Send
} from 'lucide-react';
import { API_URL } from '@/lib/config';

// TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface FooterLink {
  label: string;
  href: string;
}

interface ContactItem {
  key: string;
  label: string;
  value: string;
  icon?: string;
  url?: string;
}

interface FooterConfig {
  newsletter_title: string;
  newsletter_show: boolean;
  scam_warning_title: string;
  scam_warning_text: string;
  scam_warning_show: boolean;
  company_description: string;
  license_number: string;
  line_id: string;
  line_url: string;
  line_qr_image: string;
  col1_title: string;
  col2_title: string;
  col3_title: string;
  features: { icon: string; label: string }[];
}

// Fallback footer links
const fallbackTourLinks: FooterLink[] = [
  { label: 'ทัวร์ต่างประเทศ', href: '/tours/international' },
  { label: 'ทัวร์ในประเทศ', href: '/tours/domestic' },
  { label: 'ทัวร์โปรโมชั่น', href: '/promotions' },
  { label: 'ทัวร์ตามเทศกาล', href: '/tours/festival' },
  { label: 'แพ็คเกจทัวร์', href: '/packages' },
];

const fallbackCompanyLinks: FooterLink[] = [
  { label: 'เกี่ยวกับเรา', href: '/about' },
  { label: 'ติดต่อเรา', href: '/contact' },
  { label: 'รับจัดกรุ๊ปทัวร์', href: '/group-tours' },
  { label: 'ร่วมงานกับเรา', href: '/careers' },
  { label: 'พันธมิตรธุรกิจ', href: '/partners' },
  { label: 'รอบรู้เรื่องเที่ยว', href: '/blog' },
];

const fallbackSupportLinks: FooterLink[] = [
  { label: 'วิธีการจอง', href: '/how-to-book' },
  { label: 'การชำระเงิน', href: '/payment' },
  { label: 'คำถามที่พบบ่อย', href: '/faq' },
  { label: 'เงื่อนไขการให้บริการ', href: '/terms' },
  { label: 'เงื่อนไขชำระเงิน', href: '/payment-terms' },
  { label: 'ช่องทางการชำระเงิน', href: '/payment-channels' },
  { label: 'นโยบายคุกกี้', href: '/cookie-policy' },
  { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy-policy' },
];

const features = [
  { icon: Shield, label: 'ใบอนุญาตถูกต้อง' },
  { icon: CreditCard, label: 'ชำระเงินปลอดภัย' },
  { icon: Headphones, label: 'บริการ 24 ชม.' },
];

// Icon name to component map for dynamic features
const ICON_MAP: Record<string, React.ElementType> = {
  Shield, CreditCard, Headphones, Phone, Mail, MapPin, Clock, MessageCircle,
};

// Default footer config
const defaultFooterConfig: FooterConfig = {
  newsletter_title: 'ติดตามเพื่อรับโปรโมชั่น',
  newsletter_show: true,
  scam_warning_title: 'ระวัง !! กลุ่มมิจฉาชีพขายทัวร์และบริการอื่นๆ',
  scam_warning_text: 'โดยแอบอ้างใช้ชื่อบริษัทเน็กซ์ ทริป ฮอลิเดย์ กรุณาชำระค่าบริการผ่านธนาคารชื่อบัญชีบริษัท "เน็กซ์ ทริป ฮอลิเดย์ จำกัด" เท่านั้น',
  scam_warning_show: true,
  company_description: 'บริษัททัวร์ชั้นนำ ให้บริการจัดทัวร์ท่องเที่ยวทั้งในและต่างประเทศ ด้วยประสบการณ์กว่า 10 ปี พร้อมทีมงานมืออาชีพดูแลตลอดการเดินทาง',
  license_number: 'TAT: 11/07440',
  line_id: '@nexttripholiday',
  line_url: 'https://line.me/R/ti/p/@nexttripholiday',
  line_qr_image: '',
  col1_title: 'ทัวร์ยอดนิยม',
  col2_title: 'บริษัท',
  col3_title: 'ช่วยเหลือ',
  features: [
    { icon: 'Shield', label: 'ใบอนุญาตถูกต้อง' },
    { icon: 'CreditCard', label: 'ชำระเงินปลอดภัย' },
    { icon: 'Headphones', label: 'บริการ 24 ชม.' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [tourLinks, setTourLinks] = useState<FooterLink[]>(fallbackTourLinks);
  const [companyLinks, setCompanyLinks] = useState<FooterLink[]>(fallbackCompanyLinks);
  const [supportLinks, setSupportLinks] = useState<FooterLink[]>(fallbackSupportLinks);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [socials, setSocials] = useState<ContactItem[]>([]);
  const [businessHours, setBusinessHours] = useState<ContactItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultFooterConfig);
  
  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch footer menus, contacts, and footer config in parallel
        const [menusRes, contactsRes, footerConfigRes] = await Promise.all([
          fetch(`${API_URL}/menus/public`).then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/site-contacts/public`).then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/footer-config/public`).then((r) => r.ok ? r.json() : null).catch(() => null),
        ]);

        // Process footer menus
        if (menusRes?.success && menusRes.data) {
          const toLinks = (items: { title: string; url: string }[]): FooterLink[] =>
            items.map((item) => ({ label: item.title, href: item.url || '#' }));
          if (menusRes.data.footer_col1?.length > 0) setTourLinks(toLinks(menusRes.data.footer_col1));
          if (menusRes.data.footer_col2?.length > 0) setCompanyLinks(toLinks(menusRes.data.footer_col2));
          if (menusRes.data.footer_col3?.length > 0) setSupportLinks(toLinks(menusRes.data.footer_col3));
        }

        // Process contacts
        if (contactsRes?.success && contactsRes.data) {
          if (contactsRes.data.contact) setContacts(contactsRes.data.contact);
          if (contactsRes.data.social) setSocials(contactsRes.data.social);
          if (contactsRes.data.business_hours) setBusinessHours(contactsRes.data.business_hours);
        }

        // Process footer config
        if (footerConfigRes?.success && footerConfigRes.data) {
          setFooterConfig({ ...defaultFooterConfig, ...footerConfigRes.data });
        }
      } catch {
        // Use fallback data
      } finally {
        setDataLoaded(true);
      }
    };
    fetchFooterData();
  }, []);

  // Helper to get contact value by key
  const getContact = (key: string) => contacts.find((c) => c.key === key);
  const getSocial = (key: string) => socials.find((s) => s.key === key);

  // Determine display values with fallbacks
  const phoneContact = getContact('phone');
  const hotlineContact = getContact('hotline');
  const lineContact = getContact('line_id');
  const emailContact = getContact('email');
  const hoursDisplay = businessHours.length > 0 ? businessHours[0]?.value : 'เปิดทุกวัน 08.00-23.00 น.';

  const socialLinks = [
    { key: 'facebook', icon: Facebook, fallbackUrl: 'https://facebook.com/nexttripholiday', label: 'Facebook' },
    { key: 'instagram', icon: Instagram, fallbackUrl: 'https://instagram.com/nexttripholiday', label: 'Instagram' },
    { key: 'youtube', icon: Youtube, fallbackUrl: 'https://youtube.com/@nexttripholiday', label: 'YouTube' },
    { key: 'tiktok', icon: TikTokIcon, fallbackUrl: 'https://tiktok.com/@nexttripholiday', label: 'TikTok' },
  ];

  return (
    <footer>
      {/* Newsletter & LINE section */}
      {footerConfig.newsletter_show && (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100">
        <div className=" max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ">
          {!dataLoaded ? (
            /* Skeleton Loading */
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 w-full md:w-auto">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[42px] bg-gray-200 rounded-lg" />
                    <div className="h-[42px] w-32 bg-gray-200 rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl" />
                  <div className="text-center">
                    <div className="h-10 w-40 bg-gray-200 rounded-full mb-2" />
                    <div className="h-3 w-28 bg-gray-200 rounded mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: Newsletter */}
              <div className="flex-1 w-full md:w-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{footerConfig.newsletter_title}</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newsletterEmail.trim() || newsletterSubmitting) return;
                    setNewsletterSubmitting(true);
                    setNewsletterMessage(null);
                    try {
                      const res = await fetch(`${API_URL}/subscribers/subscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ email: newsletterEmail, source_page: 'footer' }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setNewsletterMessage({ type: 'success', text: data.message || 'สมัครสำเร็จ! กรุณาตรวจสอบอีเมล' });
                        if (!data.already_subscribed) setNewsletterEmail('');
                      } else {
                        setNewsletterMessage({ type: 'error', text: data.message || 'เกิดข้อผิดพลาด' });
                      }
                    } catch {
                      setNewsletterMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่' });
                    } finally {
                      setNewsletterSubmitting(false);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center flex-1 border border-gray-300 rounded-lg overflow-hidden">
                    <div className="px-3">
                      <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <input
                      type="email"
                      placeholder="อีเมลของคุณ"
                      value={newsletterEmail}
                      onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterMessage(null); }}
                      required
                      className="flex-1 py-2.5 pr-3 text-sm text-gray-700 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    {newsletterSubmitting ? 'กำลังส่ง...' : 'รับโปรโมชั่น'}
                  </button>
                </form>
                {newsletterMessage && (
                  <p className={`text-sm mt-2 ${newsletterMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {newsletterMessage.text}
                  </p>
                )}
              </div>

              {/* Right: LINE QR */}
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="w-[100px] h-[100px] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                  <Image
                    src={footerConfig.line_qr_image || '/images/line-qr.png'}
                    alt="LINE QR Code"
                    width={90}
                    height={90}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                <div className="text-center">
                  <a
                    href={lineContact?.url || footerConfig.line_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {footerConfig.line_id}
                  </a>
                  <p className="text-gray-500 text-xs mt-2">ติดตามเราผ่านไลน์</p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Scam warning */}
          {footerConfig.scam_warning_show && (
          <div className="mt-6 border-2 border-yellow-300 bg-yellow-50 rounded-xl px-6 py-4 text-center">
            <p className="text-red-600 font-bold text-sm flex items-center justify-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4" />
              {footerConfig.scam_warning_title}
            </p>
            <p className="text-gray-600 text-xs leading-relaxed">
              {footerConfig.scam_warning_text}
            </p>
          </div>
          )}
        </div>
      </div>
      )}

      {/* Dark footer area */}
      <div className="bg-[var(--color-gray-900)] text-white">
      {/* Features bar */}
      <div className="bg-[var(--color-primary)]">
        <div className="container-custom py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {(footerConfig.features.length > 0 ? footerConfig.features : features.map(f => ({ icon: '', label: f.label }))).map((feature, index) => {
              const IconComp = typeof feature.icon === 'string' ? ICON_MAP[feature.icon] || Shield : Shield;
              return (
                <div key={index} className="flex items-center gap-2">
                  <IconComp className="w-5 h-5 text-blue-200" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.svg"
                alt="NextTrip Holiday Logo"
                width={150}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              {footerConfig.company_description}
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              {!dataLoaded ? (
                /* Skeleton for contact info */
                <>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-gray-700 animate-pulse flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-28 bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 text-xs">{phoneContact?.label || 'สอบถามทัวร์'}</span>
                  <a href={`tel:${(phoneContact?.value || '02-136-9144').replace(/[^0-9]/g, '')}`} className="block hover:text-[var(--color-primary)] transition-colors font-semibold">
                    {phoneContact?.value || '02-136-9144'}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Headphones className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 text-xs">{hotlineContact?.label || 'Hotline (ตลอดเวลา)'}</span>
                  <a href={`tel:${(hotlineContact?.value || '091-091-6364').replace(/[^0-9]/g, '')}`} className="block hover:text-[var(--color-primary)] transition-colors font-semibold">
                    {hotlineContact?.value || '091-091-6364'}
                  </a>
                </div>
              </div>
              <a 
                href={lineContact?.url || 'https://line.me/R/ti/p/@nexttripholiday'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lineContact ? `LINE: ${lineContact.value}` : 'LINE: @nexttripholiday'}</span>
              </a>
              <a 
                href={`mailto:${emailContact?.value || 'info@nexttripholiday.com'}`}
                className="flex items-center gap-3 text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{emailContact?.value || 'info@nexttripholiday.com'}</span>
              </a>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{hoursDisplay}</span>
              </div>
                </>
              )}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {!dataLoaded ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse" />
                ))
              ) : (
                socialLinks.map((social) => {
                  const data = getSocial(social.key);
                  const url = data?.url || social.fallbackUrl;
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-[var(--color-gray-800)] hover:bg-[var(--color-primary)] flex items-center justify-center transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })
              )}
            </div>
          </div>

          {/* Tour links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{footerConfig.col1_title}</h3>
            <ul className="space-y-2.5">
              {!dataLoaded ? (
                [...Array(5)].map((_, i) => (
                  <li key={i}><div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${60 + i * 12}px` }} /></li>
                ))
              ) : (
                tourLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{footerConfig.col2_title}</h3>
            <ul className="space-y-2.5">
              {!dataLoaded ? (
                [...Array(6)].map((_, i) => (
                  <li key={i}><div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${55 + i * 10}px` }} /></li>
                ))
              ) : (
                companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{footerConfig.col3_title}</h3>
            <ul className="space-y-2.5">
              {!dataLoaded ? (
                [...Array(8)].map((_, i) => (
                  <li key={i}><div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${50 + i * 11}px` }} /></li>
                ))
              ) : (
                supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter & LINE section - removed, moved to top */}

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Next Trip Holiday Co., Ltd. สงวนลิขสิทธิ์
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">ใบอนุญาตนำเที่ยว</span>
              <span className="text-gray-400 text-sm font-medium">License {footerConfig.license_number}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
