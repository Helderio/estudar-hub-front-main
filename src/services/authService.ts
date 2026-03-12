import api from './api';
import type { RegisterData } from '@/context/AuthContext';
import type { User } from '@/types';

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
};