'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users, Phone, Mail, MessageCircle, Send,
  ChevronDown, ChevronUp, Star, CheckCircle,
  MapPin, Calendar, Globe, Award, Building2, GraduationCap,
  Landmark, Heart, Trophy, Church, Briefcase, Plane,
  Shield, Clock, Headphones, ThumbsUp, Sparkles, Gem,
  Target, Zap, Crown, HandHeart, CreditCard, BadgeCheck,
  type LucideIcon,
} from 'lucide-react';
import { groupToursApi, GroupTourPublicPage, GroupTourInquiryForm } from '@/lib/api';

const ICON_MAP: Record<string, LucideIcon> = {
  Calendar, Users, Globe, Star, Award, Trophy,
  Building2, GraduationCap, Landmark, Heart, HandHeart,
  Church, Briefcase, Plane, MapPin, Shield, Clock,
  Headphones, ThumbsUp, Sparkles, Gem, Target, Zap,
  Crown, CreditCard, BadgeCheck, CheckCircle,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComp = ICON_MAP[name];
  if (IconComp) return <IconComp className={className} />;
  // Fallback: render as emoji text if not a known icon name
  return <span className={className}>{name}</span>;
}

export default function GroupToursPage() {
  const [data, setData] = useState<GroupTourPublicPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupToursApi.getPage().then(res => {
      if (res?.data) setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">ไม่สามารถโหลดข้อมูลได้</p></div>;

  const { settings, portfolios, testimonials } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection settings={settings} />

      {/* Stats Bar */}
      {settings.stats && settings.stats.length > 0 && (
        <StatsSection stats={settings.stats} />
      )}

   

      {/* Group Types */}
      {settings.group_types && settings.group_types.length > 0 && (
        <GroupTypesSection types={settings.group_types} />
      )}

      {/* Why Choose Us / Advantages */}
      {settings.advantages && settings.advantages.length > 0 && (
        <AdvantagesSection settings={settings} />
      )}

      {/* Process Steps */}
      {settings.process_steps && settings.process_steps.length > 0 && (
        <ProcessSection steps={settings.process_steps} />
      )}

      {/* Portfolio Gallery */}
      {portfolios && portfolios.length > 0 && (
        <PortfolioSection portfolios={portfolios} />
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {/* FAQ */}
      {settings.faqs && settings.faqs.length > 0 && (
        <FAQSection faqs={settings.faqs} />
      )}

      {/* Contact / Inquiry Form */}
      <ContactSection settings={settings} />
    </div>
  );
}

// ===================== Hero Section =====================
function HeroSection({ settings }: { settings: GroupTourPublicPage['settings'] }) {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {settings.hero_image_url ? (
        <Image
          src={settings.hero_image_url}
          alt={settings.hero_title || 'รับจัดกลุ่มทัวร์'}
          fill
          className="object-cover"
          style={{ objectPosition: settings.hero_image_position || 'center' }}
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800" />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
          <Users className="w-4 h-4" />
          <span>บริการจัดกรุ๊ปทัวร์</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          {settings.hero_title || 'รับจัดกลุ่มทัวร์'}
        </h1>
        {settings.hero_subtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {settings.hero_subtitle}
          </p>
        )}
        <a
          href="#contact-form"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:bg-orange-50 transition-colors shadow-xl hover:shadow-2xl"
        >
          <Send className="w-5 h-5" />
          ขอใบเสนอราคา
        </a>
      </div>
    </section>
  );
}

// ===================== Stats Section =====================
function StatsSection({ stats }: { stats: { icon: string; value: string; label: string }[] }) {
  return (
    <section className="bg-gradient-to-r from-orange-600 to-orange-400 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center text-white">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <DynamicIcon name={stat.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/80 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== Group Types Section =====================
function GroupTypesSection({ types }: { types: { icon: string; title: string; description: string }[] }) {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">ประเภทกรุ๊ปที่รับจัด</h2>
          <p className="text-gray-500">
            วางแผนการเดินทางแบบกรุ๊ปเหมาไว้ใจเรา <span className='text-orange-500'>"Nexttrip Holiday"</span> เดินทางง่ายๆ ราคาสบายกระเป๋า
ทัวร์ส่วนตัวตั้งแต่ 2 ท่านขึ้นไป จนถึง 100 ท่าน เราพร้อมจัดโปรแกรมให้คุณ "คุ้มค่า คุ้มราคา"
เที่ยวครบเต็มอิ่ม จุใจอย่างแน่นอน
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <DynamicIcon name={type.icon} className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== Advantages Section =====================
function AdvantagesSection({ settings }: { settings: GroupTourPublicPage['settings'] }) {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            {settings.advantages_image_url ? (
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl">
                <Image src={settings.advantages_image_url} alt="ทำไมต้องเลือกเรา" fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <Users className="w-24 h-24 text-orange-300" />
              </div>
            )}
          </div>
          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {settings.advantages_title || 'ทำไมต้องเลือกเรา'}
            </h2>
            <div className="space-y-4">
              {settings.advantages.map((adv, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">{adv.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===================== Process Section =====================
function ProcessSection({ steps }: { steps: { step_number: number; title: string; description: string }[] }) {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">ขั้นตอนการจัดกรุ๊ปทัวร์</h2>
          <p className="text-gray-500">เพียงไม่กี่ขั้นตอน ก็ได้ทริปที่สมบูรณ์แบบ</p>
        </div>
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-orange-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white text-lg font-bold mb-4 relative z-10">
                  {step.step_number}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===================== Portfolio Section =====================
function PortfolioSection({ portfolios }: { portfolios: GroupTourPublicPage['portfolios'] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? portfolios : portfolios.slice(0, 6);

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">ผลงานที่ผ่านมา</h2>
          <p className="text-gray-500">กรุ๊ปทัวร์ที่เราดูแลด้วยความเอาใจใส่</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((item) => (
            <div key={item.id} className="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-video overflow-hidden">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                    <Users className="w-12 h-12 text-orange-300" />
                  </div>
                )}
                {item.group_size && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-orange-600/60 text-white text-xs rounded-full backdrop-blur-sm">
                    จำนวน {item.group_size} ท่าน
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-orange-600">
                  {item.destination && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.destination}</span>
                  )}
                </div>
                {item.caption && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
        {portfolios.length > 6 && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll(!showAll)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors">
              {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด (${portfolios.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ===================== Testimonials Section =====================
function TestimonialsSection({ testimonials }: { testimonials: GroupTourPublicPage['testimonials'] }) {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">เสียงจากลูกค้า</h2>
          <p className="text-gray-500">ความประทับใจจากองค์กรที่ไว้วางใจเรา</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 18).map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
                  {t.logo_url ? (
                    <Image src={t.logo_url} alt={t.company_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{t.company_name.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.company_name}</p>
                  {t.reviewer_name && (
                    <p className="text-xs text-gray-500">{t.reviewer_name}{t.reviewer_position ? ` - ${t.reviewer_position}` : ''}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== FAQ Section =====================
function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">คำถามที่พบบ่อย</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== Contact / Inquiry Form Section =====================
function ContactSection({ settings }: { settings: GroupTourPublicPage['settings'] }) {
  const [form, setForm] = useState<GroupTourInquiryForm>({
    name: '', phone: '', organization: '', email: '', line_id: '',
    group_type: '', group_size: '', destination: '',
    travel_date_start: '', travel_date_end: '', details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setError('กรุณากรอกชื่อและเบอร์โทร');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await groupToursApi.submitInquiry(form);
      setSubmitted(true);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    }
    setSubmitting(false);
  };

  const groupTypeOptions = [
    'ทัวร์บริษัท/องค์กร', 'ทัวร์สัมมนา', 'ทัวร์ครอบครัว/เพื่อน',
    'ทัวร์โรงเรียน/มหาวิทยาลัย', 'ทัวร์สมาคม/ชมรม', 'อื่นๆ',
  ];

  return (
    <section id="contact-form" className="py-16 md:py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {settings.cta_title || 'ติดต่อเราเลย!'}
            </h2>
            {settings.cta_description && (
              <p className="text-white/80 text-lg mb-8">{settings.cta_description}</p>
            )}
            <div className="space-y-4">
              {settings.cta_phone && (
                <a href={`tel:${settings.cta_phone}`} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                  <div><p className="text-sm text-white/60">โทรศัพท์</p><p className="font-medium text-lg">{settings.cta_phone}</p></div>
                </a>
              )}
              {settings.cta_email && (
                <a href={`mailto:${settings.cta_email}`} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                  <div><p className="text-sm text-white/60">อีเมล</p><p className="font-medium">{settings.cta_email}</p></div>
                </a>
              )}
              {settings.cta_line_id && (
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
                  <div><p className="text-sm text-white/60">LINE ID</p><p className="font-medium">{settings.cta_line_id}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ส่งข้อมูลสำเร็จ!</h3>
                <p className="text-gray-600">ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', organization: '', email: '', line_id: '', group_type: '', group_size: '', destination: '', travel_date_start: '', travel_date_end: '', details: '' }); }}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">ส่งอีกครั้ง</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">ขอใบเสนอราคา</h3>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">องค์กร/บริษัท</label>
                    <input type="text" value={form.organization || ''} onChange={e => setForm({ ...form, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร *</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LINE ID</label>
                    <input type="text" value={form.line_id || ''} onChange={e => setForm({ ...form, line_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทกรุ๊ป</label>
                    <select value={form.group_type || ''} onChange={e => setForm({ ...form, group_type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option value="">เลือกประเภท</option>
                      {groupTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนคน (โดยประมาณ)</label>
                    <input type="text" value={form.group_size || ''} onChange={e => setForm({ ...form, group_size: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="เช่น 30-50 คน" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ปลายทาง</label>
                    <input type="text" value={form.destination || ''} onChange={e => setForm({ ...form, destination: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="เช่น ญี่ปุ่น, เกาหลี" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเดินทาง (เริ่ม)</label>
                    <input type="date" value={form.travel_date_start || ''} onChange={e => setForm({ ...form, travel_date_start: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเดินทาง (สิ้นสุด)</label>
                    <input type="date" value={form.travel_date_end || ''} onChange={e => setForm({ ...form, travel_date_end: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
                  <textarea value={form.details || ''} onChange={e => setForm({ ...form, details: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border-1 border-solid border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="เช่น งบประมาณ, กิจกรรมที่ต้องการ, ข้อจำกัดพิเศษ" />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  {submitting ? 'กำลังส่ง...' : 'ส่งคำขอใบเสนอราคา'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===================== Loading Skeleton =====================
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="h-[60vh] bg-gray-200" />
      <div className="h-20 bg-orange-100" />
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        <div className="text-center space-y-3">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-80 bg-gray-100 rounded-3xl" />
          <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}</div>
        </div>
      </div>
    </div>
  );
}
