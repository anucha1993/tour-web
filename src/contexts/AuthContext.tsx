'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, authApi, Member } from '@/lib/api';

interface AuthContextType {
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithOtp: (otpRequestId: number, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setMember: (member: Member | null) => void;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load member on mount
  useEffect(() => {
    const loadMember = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const response = await authApi.me();
          if (response.success && response.member) {
            setMember(response.member);
          } else {
            // Token invalid, clear it
            api.setToken(null);
          }
        } catch {
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadMember();
  }, []);

  const login = useCallback(async (loginValue: string, password: string) => {
    const response = await authApi.login(loginValue, password);
    
    if (response.success && response.token && response.member) {
      api.setToken(response.token);
      setMember(response.member);
      return { success: true };
    }
    
    return { success: false, message: response.message };
  }, []);

  const loginWithOtp = useCallback(async (otpRequestId: number, otp: string) => {
    const response = await authApi.verifyLoginOtp(otpRequestId, otp);
    
    if (response.success && response.token && response.member) {
      api.setToken(response.token);
      setMember(response.member);
      return { success: true };
    }
    
    return { success: false, message: response.message };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    api.setToken(null);
    setMember(null);
  }, []);

  const refreshMember = useCallback(async () => {
    const response = await authApi.me();
    if (response.success && response.member) {
      setMember(response.member);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        member,
        isLoading,
        isAuthenticated: !!member,
        login,
        loginWithOtp,
        logout,
        setMember,
        refreshMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
