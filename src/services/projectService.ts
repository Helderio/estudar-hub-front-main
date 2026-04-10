import api from './api';

export const projectService = {
  getAll: (params?: Record<string, string>) => api.get('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  // For FormData in browsers, do not set Content-Type manually; Axios will add the boundary.
  create: (data: FormData) => api.post('/projects', data),
  update: (id: string, data: FormData) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addComment: (id: string, content: string) => api.post(`/projects/${id}/comments`, { content }),
};
