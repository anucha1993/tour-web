// API Configuration for tour-web
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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

// Types
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

export default api;
