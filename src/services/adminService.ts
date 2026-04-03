import api from './api';
import type { ApiResponse, PageResponse } from './apiResponse';
import type { User } from '@/types';

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

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  listUsers: (params?: { q?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<User>>>('/admin/users', { params }),
};
