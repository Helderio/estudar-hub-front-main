import api from './api';

export const userService = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  // For FormData in browsers, do not set Content-Type manually; Axios will add the boundary.
  updateProfile: (id: string, data: FormData) => api.put(`/users/${id}`, data),
  getProjects: (id: string) => api.get(`/users/${id}/projects`),
  getEvents: (id: string) => api.get(`/users/${id}/events`),
};
