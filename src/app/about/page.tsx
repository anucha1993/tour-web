import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2, Award, Users, Shield, Star,
  CheckCircle, MapPin, Globe, Briefcase,
} from 'lucide-react';
import type { AboutPageData } from '@/lib/api';
import RenderIcon from '@/components/RenderIcon';
import LicenseLightbox from './LicenseLightbox';
import { API_URL } from '@/lib/config';
import { buildMetadata } from '@/lib/seo';

/**
 * Server-side fetch of the About page content so it is present in the initial
 * HTML (SEO: Google/AI crawlers see the copy, associations, awards, etc.).
 * Cached for 5 minutes; fails soft to null so the page still renders a shell.
 */
async function getAboutData(): Promise<AboutPageData | null> {
  try {
    const res = await fetch(`${API_URL}/about/public`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as AboutPageData) ?? null;
  } catch {
    return null;
  }
}

// Per-page SEO from the admin "about" settings (falls back to global).
// buildMetadata already strips a trailing "| Next Trip Holiday" so the root
// layout's title template appends the brand exactly once.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('about', {
    path: '/about',
    title: 'เกี่ยวกับเรา',
    description:
      'รู้จัก Next Trip Holiday บริษัททัวร์ต่างประเทศคุณภาพ ประสบการณ์กว่า 10 ปี ใบอนุญาตประกอบธุรกิจนำเที่ยวถูกต้อง มีสมาชิกสมาคมท่องเที่ยวรับรอง',
  });
}

export default async function AboutPage() {
  const data = await getAboutData();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        ไม่สามารถโหลดข้อมูลได้
      </div>
    );
  }

  const { settings, associations, services, customer_groups, awards, clients } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        {settings.hero_image_url ? (
          <>
            <Image
              src={settings.hero_image_url}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: settings.hero_image_position || 'center' }}
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
        )}
        <div className="container-custom py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {settings.hero_title || 'เกี่ยวกับเรา'}
            </h1>
            {settings.hero_subtitle && (
              <p className="text-xl text-white/80">{settings.hero_subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* Highlights Stats */}
      {settings.highlights && settings.highlights.length > 0 && (
        <section className="relative -mt-12 z-20">
          <div className="container-custom">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {settings.highlights.map((h, i) => (
                  <div key={i}>
                    <div className="text-3xl md:text-4xl font-bold text-orange-500">
                      {h.value}{h.suffix}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{h.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="container-custom py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-orange-500 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{settings.about_title}</h2>
          </div>
          {settings.about_content && (
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed rich-text"
              dangerouslySetInnerHTML={{ __html: settings.about_content }}
            />
          )}
        </div>
      </section>

      {/* Value Props */}
      {settings.value_props && settings.value_props.length > 0 && (
        <section className="bg-orange-50 py-16">
          <div className="container-custom">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
              เน็กซ์ ทริป ฮอลิเดย์ ให้ลูกค้ามากกว่า
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {settings.value_props.map((v, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Company Registration */}
      {settings.registration_no && (
        <section className="container-custom py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-orange-500 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">ข้อมูลจัดตั้งบริษัท</h2>
                </div>
                <div className="space-y-4">
                  {settings.company_name && (
                    <InfoRow icon={<Building2 className="w-5 h-5 text-orange-500" />} label="ชื่อบริษัท" value={settings.company_name} />
                  )}
                  <InfoRow icon={<Briefcase className="w-5 h-5 text-orange-500" />} label="ทะเบียนพาณิชย์" value={settings.registration_no} />
                  {settings.capital && (
                    <InfoRow icon={<Globe className="w-5 h-5 text-orange-500" />} label="ทุนจดทะเบียน" value={settings.capital} />
                  )}
                  {settings.vat_no && (
                    <InfoRow icon={<MapPin className="w-5 h-5 text-orange-500" />} label="ทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)" value={settings.vat_no} />
                  )}
                  {settings.tat_license && (
                    <InfoRow icon={<Shield className="w-5 h-5 text-orange-500" />} label="ใบอนุญาตประกอบกิจการท่องเที่ยว" value={`TAT License: ${settings.tat_license}`} />
                  )}
                </div>
                {settings.company_info_extra && (
                  <p className="mt-4 text-gray-600 text-sm whitespace-pre-line">{settings.company_info_extra}</p>
                )}
              </div>

              {/* License Image (interactive lightbox is a small client component) */}
              {settings.license_image_url && (
                <LicenseLightbox src={settings.license_image_url} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Associations */}
      {associations.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-custom">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">เข้าร่วมสมาคม</h2>
              </div>
              <p className="text-gray-500">สมาชิกสมาคมที่มีมาตรฐานและน่าเชื่อถือ</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {associations.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:shadow-md transition w-[200px]">
                  {item.logo_url ? (
                    <Image src={item.logo_url} alt={item.name} width={120} height={80} className="object-contain h-20" />
                  ) : (
                    <div className="w-[120px] h-[80px] bg-gray-200 rounded flex items-center justify-center">
                      <Shield className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                    {item.license_no && <p className="text-xs text-gray-500">{item.license_no}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="container-custom py-16 md:py-20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">บริการหลักของเรา</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border-1 border-solid border-gray-100">
                {svc.icon && (
                  <div className="w-20 h-20 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <RenderIcon name={svc.icon} className="w-20 h-20 text-orange-500" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{svc.title}</h3>
                {svc.description && <p className="text-gray-600 text-sm leading-relaxed">{svc.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Groups */}
      {customer_groups.length > 0 && (
        <section className="bg-gray-100 py-16 md:py-20">
          <div className="container-custom">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Users className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">กลุ่มลูกค้าหลัก</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customer_groups.map((cg) => (
                <div key={cg.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  {cg.image_url ? (
                    <div className="relative aspect-[16/9]">
                      <Image src={cg.image_url} alt={cg.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>
                  ) : cg.icon ? (
                    <div className="aspect-[16/9] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                      <RenderIcon name={cg.icon} className="w-30 h-30 text-orange-400" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                      <Users className="w-12 h-12 text-orange-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{cg.title}</h3>
                    {cg.description && <p className="text-gray-600 text-sm">{cg.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <section className="container-custom py-16 md:py-20 ">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Award className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">รางวัลที่ได้รับ</h2>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {awards.map((item) => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition w-[220px]">
                {item.image_url ? (
                  <div className="relative h-[280px]">
                    <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="220px" />
                  </div>
                ) : (
                  <div className="h-[280px] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                    <Award className="w-16 h-16 text-orange-300" />
                  </div>
                )}
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                  {item.year && <p className="text-xs text-gray-500 mt-1">ปี {item.year}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Our Clients */}
      {clients.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="container-custom">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  ขอบคุณทุกองค์กร ที่ร่วมเดินทางไปกับเรา
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {clients.map((client) => (
                <div key={client.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-center w-[140px] h-[140px] hover:shadow-md transition">
                  {client.url ? (
                    <Image
                      src={client.url}
                      alt={client.alt || client.name}
                      width={120}
                      height={120}
                      className="object-contain max-h-[80px]"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs text-center">{client.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">พร้อมออกเดินทางไปกับเรา?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            ด้วยประสบการณ์และความเชี่ยวชาญ เราพร้อมดูแลทุกทริปของคุณ
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/tours/international" className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition">
              ค้นหาทัวร์
            </Link>
            <a href="tel:021369144" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              โทร 02-136-9144
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ===================== Info Row =====================
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
