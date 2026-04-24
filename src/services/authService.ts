import api from './api';
import type { RegisterData } from '@/context/AuthContext';
import type { User } from '@/types';
import type { ApiResponse } from './apiResponse';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    tokenType: string;
    expiresIn: number;
    profile: User;
  };
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthApiResponse>('/auth/login', payload),

  register: (payload: RegisterData) =>
    api.post<AuthApiResponse>('/auth/register', payload),

  me: () =>
    api.get<ApiResponse<User>>('/profile/me'),

  logout: () =>
    api.post('/auth/logout'),

  oauth2AuthorizeUrl: (provider: 'google' | 'github') => {
    const base = (api.defaults.baseURL ?? '/api').replace(/\/$/, '');
    return `${base}/auth/oauth2/${provider}`;
  },
};
