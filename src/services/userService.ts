import api from './api';

export const userService = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (id: string, data: FormData) => api.put(`/users/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getProjects: (id: string) => api.get(`/users/${id}/projects`),
  getEvents: (id: string) => api.get(`/users/${id}/events`),
};
