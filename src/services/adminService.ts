import api from './api';
import type { ApiResponse, PageResponse } from './apiResponse';
import type { Institution, Project, UniversityEvent, User } from '@/types';

export type AdminDashboardResponse = {
  overviewStats: {
    totalUsers: number;
    totalProjects: number;
    totalEvents: number;
    totalInstitutions: number;
    userGrowth: number;
    projectGrowth: number;
    eventGrowth: number;
    institutionGrowth: number;
  };
  userGrowthData: { month: string; users: number; projects: number }[];
  rankDistribution: { rank: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    institution: string;
    course: string;
    rank: string;
    projects: number;
    joinedAt: string;
  }[];
  topInstitutions: { name: string; sigla: string; users: number; projects: number }[];
  eventsPerMonth: { month: string; events: number }[];
};

export type AdminCourse = {
  id: number;
  nome: string;
  area?: string;
  created_at?: string;
};

export type AdminCategory = {
  id: number;
  nome: string;
};

export type UpsertInstitutionRequest = {
  nome: string;
  sigla?: string;
  logo?: string;
  website?: string;
  tipo: string;
};

export type UpsertCourseRequest = {
  nome: string;
  area?: string;
};

export type UpsertCategoryRequest = {
  nome: string;
};

export type AdminSettingsResponse = {
  appName: string;
  authMode: 'session' | 'jwt' | string;
  corsAllowedOriginPatterns: string[];
  serverTime: string;
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),

  listUsers: (params?: { q?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<User>>>('/admin/users', { params }),

  setUserVerified: (id: string, verified: boolean) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/verify`, { verified }),

  setUserRole: (id: string, role: string) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role }),

  listInstitutions: (params?: { page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Institution & { tipo?: string }>>>('/admin/institutions', { params }),

  createInstitution: (data: UpsertInstitutionRequest) =>
    api.post<ApiResponse<Institution>>('/admin/institutions', data),

  updateInstitution: (id: number | string, data: UpsertInstitutionRequest) =>
    api.put<ApiResponse<Institution>>(`/admin/institutions/${id}`, data),

  deleteInstitution: (id: number | string) =>
    api.delete<ApiResponse<void>>(`/admin/institutions/${id}`),

  listCourses: (params?: { page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<AdminCourse>>>('/admin/courses', { params }),

  createCourse: (data: UpsertCourseRequest) =>
    api.post<ApiResponse<AdminCourse>>('/admin/courses', data),

  updateCourse: (id: number | string, data: UpsertCourseRequest) =>
    api.put<ApiResponse<AdminCourse>>(`/admin/courses/${id}`, data),

  deleteCourse: (id: number | string) =>
    api.delete<ApiResponse<void>>(`/admin/courses/${id}`),

  listCategories: () => api.get<ApiResponse<AdminCategory[]>>('/admin/categories'),

  createCategory: (data: UpsertCategoryRequest) =>
    api.post<ApiResponse<AdminCategory>>('/admin/categories', data),

  updateCategory: (id: number | string, data: UpsertCategoryRequest) =>
    api.put<ApiResponse<AdminCategory>>(`/admin/categories/${id}`, data),

  deleteCategory: (id: number | string) =>
    api.delete<ApiResponse<void>>(`/admin/categories/${id}`),

  listProjects: (params?: { q?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Project>>>('/admin/projects', { params }),

  deleteProject: (id: number | string) =>
    api.delete<ApiResponse<void>>(`/admin/projects/${id}`),

  listEvents: (params?: { q?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<UniversityEvent>>>('/admin/events', { params }),

  deleteEvent: (id: number | string) =>
    api.delete<ApiResponse<void>>(`/admin/events/${id}`),

  getSettings: () => api.get<ApiResponse<AdminSettingsResponse>>('/admin/settings'),
};
