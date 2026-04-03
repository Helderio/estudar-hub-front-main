import type { AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  timestamp?: string;
  path?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export function unwrapApiResponse<T>(res: AxiosResponse<ApiResponse<T>>): T {
  return res.data.data;
}

export function unwrapApiResponseOrRaw<T>(res: AxiosResponse<unknown>): T {
  const body = res?.data;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}
