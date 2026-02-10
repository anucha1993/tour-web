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
}

export interface TourTabData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  badge_text?: string;
  badge_color?: string;
  tours: TourTabTour[];
}

export const tourTabsApi = {
  // Get all tour tabs with tours for public display
  list: () => api.get<{ data: TourTabData[] }>('/tour-tabs/public'),
  
  // Get single tab by slug
  getBySlug: (slug: string) => api.get<{ data: { tab: TourTabData; tours: TourTabTour[] } }>(`/tour-tabs/public/${slug}`),
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
  tour_category: string | null;
  min_price: number | null;
  display_price: number | null;
  price_adult: number | null;
  discount_adult: number | null;
  discount_amount: number | null;
  max_discount_percent: number | null;
  promotion_type: string;
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

export default api;
