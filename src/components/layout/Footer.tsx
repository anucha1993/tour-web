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
  MessageCircle
} from 'lucide-react';

// TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Footer links
const tourLinks = [
  { label: 'ทัวร์ต่างประเทศ', href: '/tours/international' },
  { label: 'ทัวร์ในประเทศ', href: '/tours/domestic' },
  { label: 'ทัวร์โปรโมชั่น', href: '/promotions' },
  { label: 'ทัวร์ตามเทศกาล', href: '/tours/festival' },
  { label: 'แพ็คเกจทัวร์', href: '/packages' },
];

const companyLinks = [
  { label: 'เกี่ยวกับเรา', href: '/about' },
  { label: 'ติดต่อเรา', href: '/contact' },
  { label: 'รับจัดกรุ๊ปทัวร์', href: '/group-tours' },
  { label: 'ร่วมงานกับเรา', href: '/careers' },
  { label: 'พันธมิตรธุรกิจ', href: '/partners' },
  { label: 'รอบรู้เรื่องเที่ยว', href: '/blog' },
];

const supportLinks = [
  { label: 'วิธีการจอง', href: '/how-to-book' },
  { label: 'การชำระเงิน', href: '/payment' },
  { label: 'คำถามที่พบบ่อย', href: '/faq' },
  { label: 'เงื่อนไขการให้บริการ', href: '/terms' },
  { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
];

const features = [
  { icon: Shield, label: 'ใบอนุญาตถูกต้อง' },
  { icon: CreditCard, label: 'ชำระเงินปลอดภัย' },
  { icon: Headphones, label: 'บริการ 24 ชม.' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-gray-900)] text-white">
      {/* Features bar */}
      <div className="bg-[var(--color-primary)]">
        <div className="container-custom py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <feature.icon className="w-5 h-5 text-blue-200" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
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
              บริษัททัวร์ชั้นนำ ให้บริการจัดทัวร์ท่องเที่ยวทั้งในและต่างประเทศ 
              ด้วยประสบการณ์กว่า 10 ปี พร้อมทีมงานมืออาชีพดูแลตลอดการเดินทาง
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 text-xs">สอบถามทัวร์</span>
                  <a href="tel:021369144" className="block hover:text-[var(--color-primary)] transition-colors font-semibold">
                    02-136-9144
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Headphones className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 text-xs">Hotline (ตลอดเวลา)</span>
                  <a href="tel:0910916364" className="block hover:text-[var(--color-primary)] transition-colors font-semibold">
                    091-091-6364
                  </a>
                </div>
              </div>
              <a 
                href="https://line.me/R/ti/p/@nexttripholiday" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>LINE: @nexttripholiday</span>
              </a>
              <a 
                href="mailto:info@nexttripholiday.com" 
                className="flex items-center gap-3 text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>info@nexttripholiday.com</span>
              </a>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>เปิดทุกวัน 08.00-23.00 น.</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              <a 
                href="https://facebook.com/nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--color-gray-800)] hover:bg-[var(--color-primary)] flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--color-gray-800)] hover:bg-[var(--color-primary)] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--color-gray-800)] hover:bg-[var(--color-primary)] flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://tiktok.com/@nexttripholiday" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--color-gray-800)] hover:bg-[var(--color-primary)] flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Tour links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ทัวร์ยอดนิยม</h3>
            <ul className="space-y-2.5">
              {tourLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">บริษัท</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Next Trip Holiday Co., Ltd. สงวนลิขสิทธิ์
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">ใบอนุญาตนำเที่ยว</span>
              <span className="text-gray-400 text-sm font-medium">License TAT: 11/07440 </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
