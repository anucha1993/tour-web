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
  display_mode: 'tab' | 'badge' | 'both' | 'period';
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
  display_mode?: string;
}

export const tourTabsApi = {
  // Get all tour tabs with tours for public display
  list: () => api.get<{ data: TourTabData[] }>('/tour-tabs/public'),
  
  // Get single tab by slug
  getBySlug: (slug: string) => api.get<{ data: { tab: TourTabData; tours: TourTabTour[] } }>(`/tour-tabs/public/${slug}`),

  // Get badge-type tabs with tour IDs for global badge display
  badges: () => api.get<{ data: TourTabBadge[] }>('/tour-tabs/public/badges'),
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
}

export interface CategoryRatings {
  guide?: number;
  food?: number;
  hotel?: number;
  value?: number;
  program_accuracy?: number;
  would_return?: number;
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
  status: 'pending' | 'approved' | 'rejected';
  admin_reply: string | null;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  tour?: {
    id: number;
    tour_name: string;
    slug: string;
    cover_image: string | null;
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

  // Public: Mark review as helpful
  markHelpful: (reviewId: number) =>
    api.post<{ data: { helpful_count: number } }>(`/reviews/${reviewId}/helpful`, {}),

  // Auth: Submit a review
  submitReview: (tourSlug: string, data: {
    rating: number;
    category_ratings?: CategoryRatings;
    tags?: string[];
    comment: string;
  }) => api.post<{ data: TourReview }>(`/web/reviews/${tourSlug}`, data),

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

// ==================== Review Types ====================

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
  category_ratings: Record<string, number> | null;
  tags: string[] | null;
  comment: string;
  review_source: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  images?: ReviewImage[];
  tour?: { id: number; title: string; slug: string; cover_image_url?: string } | null;
  user?: { id: number; first_name: string; last_name: string; avatar?: string } | null;
}

export interface ReviewTag {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
  usage_count: number;
  sort_order: number;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
  category_averages: Record<string, number>;
}

// ==================== Review API ====================

export const reviewApi = {
  // Get reviews for a tour (public)
  list: (tourSlug: string, params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return api.get<{ data: { summary: ReviewSummary; reviews: { data: TourReview[] } } }>(`/tours/${tourSlug}/reviews${qs ? `?${qs}` : ''}`);
  },

  // Get review summary
  summary: (tourSlug: string) =>
    api.get<{ data: ReviewSummary }>(`/tours/${tourSlug}/reviews/summary`),

  // Get review tags
  tags: () => api.get<{ data: ReviewTag[] }>('/review-tags'),

  // Get featured reviews for homepage
  featured: (limit?: number) =>
    api.get<{ data: TourReview[] }>(`/reviews/featured${limit ? `?limit=${limit}` : ''}`),

  // Mark review as helpful
  markHelpful: (reviewId: number) =>
    api.post<{ data: TourReview }>(`/reviews/${reviewId}/helpful`),

  // Check if member can review a tour
  canReview: (tourSlug: string) =>
    api.get<{ can_review: boolean; reason?: string }>(`/member/reviews/${tourSlug}/can-review`),

  // Get member's own reviews
  myReviews: () =>
    api.get<{ data: { data: TourReview[] } }>('/member/reviews/my'),

  // Submit a review (uses FormData for image upload)
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
};

export default api;
