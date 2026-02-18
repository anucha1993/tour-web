// API Configuration for tour-web
import { API_URL } from './config';

const API_BASE_URL = API_URL;

// API Response type - backend returns data directly in response, not in 'data' property
interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  error?: string;
  // Include all properties from T directly
  [key: string]: unknown;
}

// Helper type to extract data from response
type ResponseData<T> = ApiResponse & T;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('member_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('member_token', token);
      } else {
        localStorage.removeItem('member_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ResponseData<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'เกิดข้อผิดพลาด',
          errors: data.errors,
          error: data.error,
        } as ResponseData<T>;
      }

      return data as ResponseData<T>;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        error: 'network_error',
      } as ResponseData<T>;
    }
  }

  async get<T>(endpoint: string): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  // Request OTP for registration
  requestRegisterOtp: (phone: string) =>
    api.post<{ otp_request_id: number; expires_in: number; debug_otp?: string }>('/web/auth/register/request-otp', { phone }),

  // Complete registration
  register: (data: {
    otp_request_id: number;
    otp: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    consent_terms: boolean;
    consent_privacy: boolean;
    consent_marketing?: boolean;
  }) => api.post<{ member: Member; token: string }>('/web/auth/register', data),

  // Login with email/phone + password
  login: (login: string, password: string) =>
    api.post<{ member: Member; token: string }>('/web/auth/login', { login, password }),

  // Request OTP for login
  requestLoginOtp: (phone: string) =>
    api.post<{ otp_request_id: number; expires_in: number }>('/web/auth/login/request-otp', { phone }),

  // Verify OTP login
  verifyLoginOtp: (otp_request_id: number, otp: string) =>
    api.post<{ member: Member; token: string }>('/web/auth/login/verify-otp', { otp_request_id, otp }),

  // Request password reset
  forgotPassword: (email: string) =>
    api.post('/web/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token: string, password: string, password_confirmation: string) =>
    api.post('/web/auth/reset-password', { token, password, password_confirmation }),

  // Logout
  logout: () => api.post('/web/auth/logout'),

  // Get current member
  me: () => api.get<{ member: Member }>('/web/me'),

  // Update profile
  updateProfile: (data: Partial<Member>) => api.put<{ member: Member }>('/web/profile', data),

  // Change password
  changePassword: (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => api.put('/web/password', {
    current_password: data.current_password,
    password: data.new_password,
    password_confirmation: data.new_password_confirmation,
  }),
};

// Wishlist API
export const wishlistApi = {
  getAll: () => api.get('/web/wishlist'),
  getCount: () => api.get<{ count: number }>('/web/wishlist/count'),
  toggle: (tour_id: number) => api.post<{ in_wishlist: boolean }>('/web/wishlist/toggle', { tour_id }),
  check: (tourId: number) => api.get<{ in_wishlist: boolean }>(`/web/wishlist/check/${tourId}`),
  remove: (tourId: number) => api.delete(`/web/wishlist/${tourId}`),
};

// Page Content API
export const pageContentApi = {
  get: (key: string) => api.get<{ data: PageContent }>(`/web/page-content/${key}`),
};

export interface PageContent {
  key: string;
  title: string;
  description: string;
  content: string;
  updated_at: string;
}

// Tour Tabs API
export interface TourTabTour {
  id: number;
  slug: string;
  title: string;
  tour_code: string;
  country: {
    id: number;
    name: string;
    iso2?: string;
  };
  days: number;
  nights: number;
  price: number | null;
  original_price: number | null;
  discount_adult: number | null;
  discount_percent: number | null;
  departure_date: string | null;
  max_departure_date: string | null;
  airline?: string;
  image_url: string | null;
  badge?: string;
  rating?: number;
  review_count?: number;
  available_seats?: number;
  view_count?: number;
  hotel_star?: number | null;
}

export interface TourTabData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  badge_text?: string;
  badge_color?: string;
  display_modes: ('tab' | 'badge' | 'period' | 'promotion')[];
  badge_icon?: string;
  tours: TourTabTour[];
}

export interface TourTabBadge {
  id: number;
  name: string;
  badge_text: string;
  badge_color: string;
  badge_icon?: string;
  tour_ids: number[];
  discount_min_amount?: number | null;
  display_modes?: string[];
}

export const tourTabsApi = {
  // Get all tour tabs with tours for public display
  list: () => api.get<{ data: TourTabData[] }>('/tour-tabs/public'),
  
  // Get single tab by slug
  getBySlug: (slug: string) => api.get<{ data: { tab: TourTabData; tours: TourTabTour[] } }>(`/tour-tabs/public/${slug}`),

  // Get badge-type tabs with tour IDs for global badge display
  badges: () => api.get<{ data: TourTabBadge[] }>('/tour-tabs/public/badges'),

  // Get promotion-type tabs with tours for promotions page
  promotions: () => api.get<{ data: TourTabData[] }>('/tour-tabs/public/promotions'),
};

// Recommended Tours types
export interface RecommendedToursData {
  title: string;
  subtitle: string | null;
  section_name: string;
  tours: TourTabTour[];
}

export const recommendedToursApi = {
  // Get recommended tours for public display (returns single section)
  get: () => api.get<{ data: RecommendedToursData | null }>('/recommended-tours/public'),
};

// Tour Detail types
export interface TourDetailOffer {
  price_adult: number;
  discount_adult: number;
  net_price_adult: number;
  price_child: number | null;
  discount_child_bed: number;
  price_child_nobed: number | null;
  discount_child_nobed: number;
  price_infant: number | null;
  price_joinland: number | null;
  price_single: number | null;
  discount_single: number;
  deposit: number | null;
  promo_name: string | null;
}

export interface TourDetailPeriod {
  id: number;
  start_date: string;
  end_date: string;
  capacity: number;
  booked: number;
  available: number;
  status: string;
  sale_status: string;
  guarantee_status: string;
  offer: TourDetailOffer | null;
}

export interface TourDetailItinerary {
  day_number: number;
  title: string;
  description: string | null;
  places: string[] | null;
  accommodation: string | null;
  hotel_star: number | null;
  has_breakfast: boolean;
  has_lunch: boolean;
  has_dinner: boolean;
  meals_note: string | null;
  images: string[] | null;
}

export interface TourDetailTransport {
  transport_code: string | null;
  transport_name: string | null;
  flight_no: string | null;
  route_from: string | null;
  route_to: string | null;
  depart_time: string | null;
  arrive_time: string | null;
  transport_type: string;
  day_no: number | null;
  airline: {
    code: string;
    name: string;
    image: string | null;
  } | null;
}

export interface TourDetailGallery {
  url: string;
  thumbnail_url: string | null;
  alt: string | null;
  caption: string | null;
}

export interface TourDetailVideo {
  id: number;
  video_url: string;
  thumbnail_url: string | null;
  title: string;
  description: string | null;
}

export interface TourDetailCountry {
  id: number;
  name: string;
  name_en: string;
  iso2: string;
  flag_emoji: string | null;
}

export interface TourDetail {
  id: number;
  slug: string;
  tour_code: string;
  title: string;
  tour_type: string;
  description: string | null;
  primary_country: TourDetailCountry | null;
  countries: TourDetailCountry[];
  cities: { id: number; name: string; name_en: string; country_id: number }[];
  locations: { name: string; name_en: string | null; city: string | null }[];
  region: string | null;
  sub_region: string | null;
  duration_days: number;
  duration_nights: number;
  highlights: string[] | null;
  shopping_highlights: string[] | null;
  food_highlights: string[] | null;
  special_highlights: string[] | null;
  hotel_star: number | null;
  hotel_star_min: number | null;
  hotel_star_max: number | null;
  inclusions: string | null;
  exclusions: string | null;
  conditions: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  gallery: TourDetailGallery[];
  gallery_images: TourDetailGallery[];
  gallery_videos: TourDetailVideo[];
  pdf_url: string | null;
  hashtags: string[] | null;
  themes: string[] | null;
  suitable_for: string[] | null;
  keywords: string[] | null;
  badge: string | null;
  min_price: number | null;
  display_price: number | null;
  price_adult: number | null;
  discount_adult: number | null;
  discount_amount: number | null;
  max_discount_percent: number | null;
  discount_label: string | null;
  departure_airports: string[] | null;
  transports: TourDetailTransport[];
  next_departure_date: string | null;
  total_departures: number;
  available_seats: number;
  periods: TourDetailPeriod[];
  itineraries: TourDetailItinerary[];
  view_count: number;
  popularity_score: number;
  meta_title: string | null;
  meta_description: string | null;
}

export const tourDetailApi = {
  get: (slug: string) => api.get<{ data: TourDetail }>(`/tours/detail/${slug}`),
  recordView: (slug: string, data?: { referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; session_id?: string }) =>
    api.post<{ success: boolean }>(`/tours/detail/${slug}/view`, data),
  getRelatedTours: (slug: string) => api.get<{ data: TourTabTour[] }>(`/tours/detail/${slug}/related`),
};

// Member API
export const memberApi = {
  // Billing Addresses
  getBillingAddresses: () => api.get<{ addresses: BillingAddress[] }>('/web/billing-addresses'),
  createBillingAddress: (data: Partial<BillingAddress>) => 
    api.post<{ address: BillingAddress }>('/web/billing-addresses', data),
  updateBillingAddress: (id: number, data: Partial<BillingAddress>) => 
    api.put<{ address: BillingAddress }>(`/web/billing-addresses/${id}`, data),
  deleteBillingAddress: (id: number) => api.delete(`/web/billing-addresses/${id}`),
  setDefaultBillingAddress: (id: number) => 
    api.put<{ address: BillingAddress }>(`/web/billing-addresses/${id}/default`, {}),
};

// Types
export interface BillingAddress {
  id: number;
  type: 'personal' | 'company';
  is_default: boolean;
  name?: string;
  company_name?: string;
  tax_id?: string;
  branch_name?: string;
  address: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  phone: string;
  email?: string;
}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  line_id?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_verified: boolean;
  avatar?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  consent_marketing: boolean;
  created_at: string;
  total_points?: number;
  lifetime_points?: number;
  lifetime_spending?: number;
  level?: {
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

// Booking API
export const bookingApi = {
  // Request OTP for booking (guest only)
  requestOtp: (phone: string) =>
    api.post<{ otp_request_id: number; expires_in: number; debug_otp?: string }>('/web/booking/request-otp', { phone }),

  // Verify OTP for booking (guest only)
  verifyOtp: (otp_request_id: number, otp: string) =>
    api.post<{ phone_msisdn: string }>('/web/booking/verify-otp', { otp_request_id, otp }),

  // Submit booking (debug mode)
  submit: (data: {
    tour_id: number;
    period_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    qty_adult: number;
    qty_adult_single: number;
    qty_child_bed: number;
    qty_child_nobed: number;
    sale_code?: string;
    special_request?: string;
    consent_terms: boolean;
    otp_request_id?: number;
    otp_verified?: boolean;
  }) => api.post<{ debug: boolean; booking_data: Record<string, unknown> }>('/web/booking/submit', data),
};

// ===================== Tour Reviews =====================

export interface ReviewTag {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
  usage_count: number;
  sort_order: number;
}

export interface CategoryRatings {
  guide?: number;
  food?: number;
  hotel?: number;
  value?: number;
  program_accuracy?: number;
  would_return?: number;
}

export interface ReviewImage {
  id: number;
  tour_review_id: number;
  image_url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface TourReview {
  id: number;
  tour_id: number;
  user_id: number | null;
  reviewer_name: string;
  reviewer_avatar_url: string | null;
  rating: number;
  category_ratings: CategoryRatings | null;
  tags: string[] | null;
  comment: string | null;
  review_source: 'self' | 'assisted' | 'internal';
  tour_type: 'individual' | 'private' | 'corporate';
  status: 'pending' | 'approved' | 'rejected';
  admin_reply: string | null;
  replied_at: string | null;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  images?: ReviewImage[];
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  tour?: {
    id: number;
    title: string;
    slug: string;
    tour_code: string;
    tour_name?: string;
    cover_image?: string | null;
    cover_image_url?: string | null;
  };
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
  category_averages: Record<string, number>;
}

export interface ReviewSchemaOrg {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  aggregateRating: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  review?: Array<{
    '@type': string;
    author: { '@type': string; name: string };
    reviewRating: { '@type': string; ratingValue: number; bestRating: number; worstRating: number };
    reviewBody: string;
    datePublished: string;
  }>;
}

export const reviewApi = {
  // Public: Get approved reviews for a tour
  getReviews: (tourSlug: string, params?: { sort?: string; rating?: number; page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return api.get<{ data: { summary: ReviewSummary; reviews: { data: TourReview[]; current_page: number; last_page: number; total: number } } }>(`/tours/${tourSlug}/reviews${qs ? `?${qs}` : ''}`);
  },

  // Public: Get review summary + Schema.org data
  getSummary: (tourSlug: string) =>
    api.get<{ data: { summary: ReviewSummary; featured_reviews: TourReview[]; schema: ReviewSchemaOrg | null } }>(`/tours/${tourSlug}/reviews/summary`),

  // Public: Get available tags
  getTags: () =>
    api.get<{ data: ReviewTag[] }>('/review-tags'),

  // Alias for getTags (used by member reviews page)
  tags: () =>
    api.get<{ data: ReviewTag[] }>('/review-tags'),

  // Public: Get featured reviews for homepage
  featured: (limit?: number) =>
    api.get<{ data: TourReview[] }>(`/reviews/featured${limit ? `?limit=${limit}` : ''}`),

  // Public: Mark review as helpful
  markHelpful: (reviewId: number) =>
    api.post<{ data: { helpful_count: number } }>(`/reviews/${reviewId}/helpful`, {}),

  // Auth: Submit a review (JSON)
  submitReview: (tourSlug: string, data: {
    rating: number;
    category_ratings?: CategoryRatings;
    tags?: string[];
    comment: string;
    tour_type?: 'individual' | 'private' | 'corporate';
  }) => api.post<{ data: TourReview }>(`/web/reviews/${tourSlug}`, data),

  // Auth: Submit a review with images (FormData)
  store: async (tourSlug: string, formData: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('member_token') : null;
    const res = await fetch(`${API_BASE_URL}/member/reviews/${tourSlug}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return res.json();
  },

  // Auth: Check if member can review a tour
  canReview: (tourSlug: string) =>
    api.get<{ data: { can_review: boolean; existing_review: TourReview | null } }>(`/web/reviews/${tourSlug}/can-review`),

  // Auth: Get member's own reviews
  myReviews: (page?: number) => {
    const qs = page ? `?page=${page}` : '';
    return api.get<{ data: { data: TourReview[]; current_page: number; last_page: number; total: number } }>(`/web/reviews/my${qs}`);
  },
};

// ===================== International Tours Listing =====================

export interface InternationalTourOffer {
  price_adult: number;
  discount_adult: number;
  net_price_adult: number;
  price_child: number | null;
  price_child_nobed: number | null;
  price_infant: number | null;
  price_joinland: number | null;
  price_single: number | null;
  discount_single: number;
  net_price_single: number | null;
  deposit: number | null;
  commission_agent?: string;
  commission_sale?: string;
}

export interface InternationalTourPeriod {
  id: number;
  start_date: string;
  end_date: string;
  capacity: number;
  booked: number;
  available: number;
  status: string;
  sale_status: string;
  guarantee_status: string;
  offer: InternationalTourOffer | null;
}

export interface InternationalTourTransport {
  flight_no: string | null;
  route_from: string | null;
  route_to: string | null;
  depart_time: string | null;
  arrive_time: string | null;
  transport_type: string;
  airline: { code: string; name: string; image: string | null } | null;
}

export interface InternationalTourItem {
  id: number;
  slug: string;
  tour_code: string;
  title: string;
  tour_type: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  duration_days: number;
  duration_nights: number;
  min_price: number | null;
  display_price: number | null;
  price_adult: number | null;
  discount_adult: number | null;
  discount_amount: number | null;
  max_discount_percent: number | null;
  discount_label: string | null;
  badge: string | null;
  available_seats: number;
  next_departure_date: string | null;
  total_departures: number;
  pdf_url: string | null;
  highlights: string[];
  shopping_highlights: string[];
  food_highlights: string[];
  hashtags: string[];
  departure_airports: string[];
  country: { id: number; name_th: string; iso2: string } | null;
  cities: { id: number; name_th: string; slug: string }[];
  hotel_star?: number | null;
  hotel_star_min?: number | null;
  hotel_star_max?: number | null;
  meal_count?: { breakfast: number; lunch: number; dinner: number; total: number };
  transports?: InternationalTourTransport[];
  periods?: InternationalTourPeriod[];
}

export interface InternationalTourFilters {
  countries?: { id: number; name_th: string; slug: string; iso2: string; tour_count: number }[];
  cities?: { id: number; name_th: string; country_id: number; country_name: string; tour_count: number }[];
  airlines?: { id: number; code: string; name: string; image: string | null }[];
  departure_months?: { value: string; label: string }[];
}

export interface InternationalTourSettings {
  show_periods: boolean;
  max_periods_display: number;
  show_transport: boolean;
  show_hotel_star: boolean;
  show_meal_count: boolean;
  show_commission: boolean;
  filter_country: boolean;
  filter_city: boolean;
  filter_search: boolean;
  filter_airline: boolean;
  filter_departure_month: boolean;
  filter_price_range: boolean;
  sort_options: Record<string, string>;
  cover_image_url?: string | null;
  cover_image_position?: string;
}

export interface InternationalToursResponse {
  data: InternationalTourItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: InternationalTourFilters;
  settings: InternationalTourSettings;
  active_filters?: {
    country?: { id: number; name_th: string; name_en: string; slug: string; iso2: string } | null;
    city?: { id: number; name_th: string; name_en: string; slug: string; country_id: number } | null;
  };
}

export const internationalToursApi = {
  // List tours with filters and pagination
  list: (params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return api.get<InternationalToursResponse>(`/tours/international${qs ? `?${qs}` : ''}`);
  },

  // Get display settings
  getSettings: () =>
    api.get<{ data: InternationalTourSettings }>('/tours/international/settings'),
};

// ===================== Domestic Tours Listing =====================

// Reuse the same item/period/transport/offer types – the API returns the same shape
export type DomesticTourItem = InternationalTourItem;
export type DomesticTourPeriod = InternationalTourPeriod;
export type DomesticTourTransport = InternationalTourTransport;
export type DomesticTourOffer = InternationalTourOffer;

export interface DomesticTourFilters {
  cities?: { id: number; name_th: string; country_id: number; country_name: string; tour_count: number }[];
  airlines?: { id: number; code: string; name: string; image: string | null }[];
  departure_months?: { value: string; label: string }[];
}

export interface DomesticTourSettings {
  show_periods: boolean;
  max_periods_display: number;
  show_transport: boolean;
  show_hotel_star: boolean;
  show_meal_count: boolean;
  show_commission: boolean;
  filter_city: boolean;
  filter_search: boolean;
  filter_airline: boolean;
  filter_departure_month: boolean;
  filter_price_range: boolean;
  sort_options: Record<string, string>;
  cover_image_url?: string | null;
  cover_image_position?: string;
}

export interface DomesticToursResponse {
  data: DomesticTourItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: DomesticTourFilters;
  settings: DomesticTourSettings;
  active_filters?: {
    city?: { id: number; name_th: string; name_en: string; slug: string; country_id: number } | null;
  };
}

export const domesticToursApi = {
  // List tours with filters and pagination
  list: (params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return api.get<DomesticToursResponse>(`/tours/domestic${qs ? `?${qs}` : ''}`);
  },

  // Get display settings
  getSettings: () =>
    api.get<{ data: DomesticTourSettings }>('/tours/domestic/settings'),
};

// ===================== Festival Tours Listing =====================

export interface FestivalCountryInfo {
  id: number;
  name_th: string;
  slug: string;
  iso2: string;
  tour_count: number;
}

export interface FestivalHolidayPublic {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  start_date: string;
  end_date: string;
  date_range_text: string;
  image_url: string | null;
  badge_text: string | null;
  badge_color: string;
  badge_icon: string | null;
  tour_count: number;
  countries?: FestivalCountryInfo[];
}

export type FestivalTourItem = InternationalTourItem;
export type FestivalTourPeriod = InternationalTourPeriod;

export interface FestivalTourFilters {
  countries?: { id: number; name_th: string; slug: string; iso2: string; tour_count: number }[];
  cities?: { id: number; name_th: string; country_id: number; country_name: string; tour_count: number }[];
  airlines?: { id: number; code: string; name: string; image: string | null }[];
  departure_months?: { value: string; label: string }[];
}

export interface FestivalTourSettings {
  show_periods: boolean;
  max_periods_display: number;
  show_transport: boolean;
  show_hotel_star: boolean;
  show_meal_count: boolean;
  show_commission: boolean;
  filter_country: boolean;
  filter_city: boolean;
  filter_search: boolean;
  filter_airline: boolean;
  filter_departure_month: boolean;
  filter_price_range: boolean;
  sort_options: Record<string, string>;
  cover_image_url?: string | null;
  cover_image_position?: string;
}

export interface FestivalToursResponse {
  data: FestivalTourItem[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  filters: FestivalTourFilters;
  settings: FestivalTourSettings;
  festival: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    start_date: string;
    end_date: string;
    date_range_text: string;
    badge_text: string | null;
    badge_color: string;
    badge_icon: string | null;
    cover_image_url: string | null;
    cover_image_position: string;
  };
}

export interface FestivalBadge {
  id: number;
  name: string;
  badge_text: string;
  badge_color: string;
  badge_icon: string | null;
  display_modes: string[];
  tour_ids: number[];
  period_ids: number[];
}

export const festivalToursApi = {
  list: () =>
    api.get<{ data: FestivalHolidayPublic[] }>('/tours/festival'),

  getBySlug: (slug: string, params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    const decodedSlug = decodeURIComponent(slug);
    return api.get<FestivalToursResponse>(`/tours/festival/${encodeURIComponent(decodedSlug)}${qs ? `?${qs}` : ''}`);
  },

  badges: () =>
    api.get<{ data: FestivalBadge[] }>('/tours/festival-badges'),

  pageSettings: () =>
    api.get<{ cover_image_url: string | null; cover_image_position: string }>('/tours/festival/page-settings'),
};

// ===================== Tour Packages =====================

export interface TourPackagePublic {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  hashtags: string[];
  countries: Array<{ id: number; name_th: string; iso2: string; slug: string }>;
  expires_at: string | null;
  is_never_expire: boolean;
}

export interface TourPackageDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  terms: string | null;
  remarks: string | null;
  cancellation_policy: string | null;
  inclusions: string[];
  exclusions: string[];
  timeline: Array<{ day_number: number; detail: string }>;
  image_url: string | null;
  pdf_url: string | null;
  hashtags: string[];
  countries: Array<{ id: number; name_th: string; iso2: string; slug: string }>;
  expires_at: string | null;
  is_never_expire: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

export const tourPackagesApi = {
  list: () =>
    api.get<{ data: TourPackagePublic[] }>('/tours/packages'),

  getBySlug: (slug: string) => {
    const decodedSlug = decodeURIComponent(slug);
    return api.get<{ data: TourPackageDetail }>(`/tours/packages/${encodeURIComponent(decodedSlug)}`);
  },

  pageSettings: () =>
    api.get<{ cover_image_url: string | null; cover_image_position: string }>('/tours/packages/page-settings'),
};

// ===================== Search & Autocomplete =====================

export interface SearchAutocompleteItem {
  type: 'country' | 'city' | 'festival' | 'tour';
  id: number;
  title: string;
  subtitle?: string;
  url: string;
  image?: string | null;
  icon?: string | null;
  tour_count?: number;
  country?: string | null;
  country_flag?: string | null;
  price?: string | null;
}

export interface PopularSearchData {
  popular_destinations: {
    type: string;
    title: string;
    url: string;
    icon?: string;
    image?: string | null;
    count: number;
  }[];
  festivals: {
    type: string;
    title: string;
    url: string;
    icon?: string;
    count: number;
  }[];
  trending_tours: {
    type: string;
    title: string;
    url: string;
    image?: string | null;
    price?: string | null;
    country?: string | null;
  }[];
}

// ===================== Group Tours (Public) =====================

export interface GroupTourPublicPage {
  settings: {
    hero_title: string;
    hero_subtitle: string;
    hero_image_url: string | null;
    hero_image_position: string;
    content: string | null;
    stats: { icon: string; value: string; label: string }[];
    group_types: { icon: string; title: string; description: string }[];
    advantages_title: string;
    advantages_image_url: string | null;
    advantages: { text: string }[];
    process_steps: { step_number: number; title: string; description: string }[];
    faqs: { question: string; answer: string }[];
    cta_title: string;
    cta_description: string;
    cta_phone: string;
    cta_email: string;
    cta_line_id: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
  };
  portfolios: {
    id: number;
    title: string;
    caption: string | null;
    group_size: string | null;
    destination: string | null;
    image_url: string | null;
    logo_url: string | null;
    group_type: string | null;
  }[];
  testimonials: {
    id: number;
    reviewer_name: string;
    reviewer_avatar_url: string | null;
    comment: string;
    rating: number;
    tour_type: 'individual' | 'private' | 'corporate';
    tags: string[] | null;
    is_featured: boolean;
    tour: { title: string; slug: string } | null;
    created_at: string;
  }[];
  testimonial_settings: {
    title: string;
    subtitle: string | null;
    show_section: boolean;
  };
}

export interface GroupTourInquiryForm {
  name: string;
  organization?: string;
  phone: string;
  email?: string;
  line_id?: string;
  group_type?: string;
  group_size?: string;
  destination?: string;
  travel_date_start?: string;
  travel_date_end?: string;
  details?: string;
}

export const groupToursApi = {
  getPage: () =>
    api.get<{ data: GroupTourPublicPage }>('/tours/group'),

  submitInquiry: (data: GroupTourInquiryForm) =>
    api.post<{ message: string }>('/tours/group/inquiry', data),
};

// ===================== Search & Autocomplete =====================

export const searchApi = {
  autocomplete: (q: string) =>
    api.get<{ data: SearchAutocompleteItem[] }>(`/search/autocomplete?q=${encodeURIComponent(q)}`),

  search: (q: string, page?: number) =>
    api.get<{ data: unknown[]; meta: { total: number; current_page: number; last_page: number } }>(
      `/search?q=${encodeURIComponent(q)}${page ? `&page=${page}` : ''}`
    ),

  popular: () =>
    api.get<{ data: PopularSearchData }>('/search/popular'),

  suggestions: (q?: string) =>
    api.get<{ data: string[] }>(`/search/suggestions${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  trackKeyword: (keyword: string, resultCount?: number) =>
    api.post('/search/track', { keyword, result_count: resultCount || 0 }),
};

// ===================== Blog =====================

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  posts_count?: number;
}

export interface BlogPost {
  id: number;
  category_id: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string;
  author_avatar_url: string | null;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  tags: string[] | null;
  reading_time_min: number | null;
  category?: { id: number; name: string; slug: string } | null;
  created_at: string;
}

export interface BlogPageSettings {
  id: number;
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_image_position: string;
}

export const blogApi = {
  getSettings: () =>
    api.get<{ data: BlogPageSettings }>('/blog/settings'),

  getCategories: () =>
    api.get<{ data: BlogCategory[] }>('/blog/categories'),

  getPosts: (params?: { category?: string; tag?: string; featured?: boolean; search?: string; page?: number; per_page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.append('category', params.category);
    if (params?.tag) sp.append('tag', params.tag);
    if (params?.featured) sp.append('featured', '1');
    if (params?.search) sp.append('search', params.search);
    if (params?.page) sp.append('page', String(params.page));
    if (params?.per_page) sp.append('per_page', String(params.per_page));
    const qs = sp.toString();
    return api.get<{ data: BlogPost[]; current_page: number; last_page: number; total: number }>(
      `/blog/posts${qs ? `?${qs}` : ''}`
    );
  },

  getPost: (slug: string) =>
    api.get<{ data: BlogPost; related: BlogPost[] }>(`/blog/posts/${slug}`),
};

// ===================== About Page =====================

export interface AboutPageSettings {
  id: number;
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_image_position: string;
  about_title: string;
  about_content: string | null;
  highlights: { label: string; value: string; suffix?: string }[] | null;
  value_props: string[] | null;
  company_name: string | null;
  registration_no: string | null;
  capital: string | null;
  vat_no: string | null;
  tat_license: string | null;
  company_info_extra: string | null;
  license_image_url: string | null;
}

export interface AboutAssociation {
  id: number;
  name: string;
  license_no: string | null;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
}

export interface AboutServiceItem {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface AboutCustomerGroup {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface AboutAward {
  id: number;
  title: string;
  description: string | null;
  year: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface OurClientPublic {
  id: number;
  url: string;
  thumbnail_url: string | null;
  name: string;
  alt: string | null;
  description: string | null;
  website_url: string | null;
}

export interface AboutPageData {
  settings: AboutPageSettings;
  associations: AboutAssociation[];
  services: AboutServiceItem[];
  customer_groups: AboutCustomerGroup[];
  awards: AboutAward[];
  clients: OurClientPublic[];
}

export const aboutApi = {
  getPage: () =>
    api.get<{ data: AboutPageData }>('/about/public'),
};

// ─── Flash Sale Types & API ───

export interface FlashSalePublicItem {
  id: number;
  slug: string;
  title: string;
  tour_code: string;
  country: { id: number; name: string; iso2: string };
  days: number;
  nights: number;
  price: number;
  original_price: number;
  departure_date: string | null;
  airline: string | null;
  image_url: string | null;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  available_seats: number;
  view_count: number;
  hotel_star: number | null;
  // Flash sale specific
  flash_price: number;
  original_price_snapshot: number;
  discount_percent: number;
  quantity_limit: number | null;
  quantity_sold: number;
  remaining: number | null;
  sold_percent: number | null;
  is_sold_out: boolean;
  // Per-item countdown & period info
  flash_end_date: string;
  period_start_date: string;
  period_end_date: string;
}

export interface FlashSalePublic {
  id: number;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  start_date: string;
  end_date: string;
  is_running: boolean;
  is_upcoming: boolean;
  items: FlashSalePublicItem[];
}

export const flashSaleApi = {
  getActive: () =>
    api.get<{ data: FlashSalePublic[] }>('/flash-sales/public'),
};

// ─── Contact Us Types & API ───

export interface ContactPageSettings {
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  intro_text: string | null;
  map_embed_url: string | null;
  office_name: string | null;
  office_address: string | null;
  office_lat: string | null;
  office_lng: string | null;
  show_map: boolean;
  show_form: boolean;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

export interface SiteContactItem {
  id: number;
  key: string;
  label: string;
  value: string;
  icon?: string;
  url?: string;
}

export interface ContactPageData {
  settings: ContactPageSettings;
  contacts: SiteContactItem[];
  socials: SiteContactItem[];
  business_hours: SiteContactItem[];
}

export const contactApi = {
  getPage: () =>
    api.get<{ data: ContactPageData }>('/contact/public'),
  submitForm: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    api.post<{ data: unknown; message: string }>('/contact/submit', data),
};

// ===== Member Points & Levels =====

export interface MemberPointLevel {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  min_spending: number;
  discount_percent: number;
  point_multiplier: number;
  redemption_rate: number;
  benefits: string[] | null;
}

export interface MemberPointSummary {
  total_points: number;
  lifetime_points: number;
  lifetime_spending: number;
  level: MemberPointLevel | null;
  next_level: {
    name: string;
    icon: string | null;
    min_spending: number;
    spending_needed: number;
    progress_percent: number;
  } | null;
  expiring_points: number;
  this_month_earned: number;
}

export interface MemberPointTransaction {
  id: number;
  member_id: number;
  rule_id: number | null;
  type: 'earn' | 'spend' | 'expire' | 'adjust';
  points: number;
  balance_after: number;
  description: string | null;
  expires_at: string | null;
  is_expired: boolean;
  created_at: string;
  rule?: { id: number; action: string; name: string; icon: string | null };
}

export interface MemberPointRule {
  id: number;
  action: string;
  name: string;
  description: string | null;
  icon: string | null;
  calc_type: 'fixed' | 'percent';
  points: number;
  percent_of_amount: number;
  max_points_per_day: number | null;
  max_points_per_action: number | null;
  cooldown_minutes: number;
}

export const memberPointsApi = {
  getSummary: () =>
    api.get<{ data: MemberPointSummary }>('/web/points/summary'),

  getHistory: (params?: { type?: string; page?: number; per_page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.type) sp.append('type', params.type);
    if (params?.page) sp.append('page', String(params.page));
    if (params?.per_page) sp.append('per_page', String(params.per_page));
    return api.get<{
      data: {
        data: MemberPointTransaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>(`/web/points/history?${sp}`);
  },

  getLevels: () =>
    api.get<{ data: MemberPointLevel[] }>('/web/points/levels'),

  getRules: () =>
    api.get<{ data: MemberPointRule[] }>('/web/points/rules'),

  previewRedeem: (points: number) =>
    api.post<{
      data: {
        points: number;
        redemption_rate: number;
        discount_amount: number;
        remaining_points: number;
      };
    }>('/web/points/preview-redeem', { points }),

  redeem: (points: number, bookingCode?: string) =>
    api.post<{
      data: {
        redemption_id: number;
        points_used: number;
        discount_amount: number;
        remaining_points: number;
      };
      message: string;
    }>('/web/points/redeem', { points, booking_code: bookingCode }),
};

export default api;
