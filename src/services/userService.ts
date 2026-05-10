import api from './api';

export const userService = {
  list: (params?: { q?: string; page?: number; size?: number; sort?: string }) => api.get('/users', { params }),
  getProfile: (id: string) => api.get(`/users/${id}`),
  // For FormData in browsers, do not set Content-Type manually; Axios will add the boundary.
  updateProfile: (id: string, data: FormData) => api.put(`/users/${id}`, data),
  getProjects: (id: string) => api.get(`/users/${id}/projects`),
  getEvents: (id: string) => api.get(`/users/${id}/events`),
};
