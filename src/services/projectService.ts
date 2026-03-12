import api from './api';

export const projectService = {
  getAll: (params?: Record<string, string>) => api.get('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: FormData) => api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addComment: (id: string, content: string) => api.post(`/projects/${id}/comments`, { content }),
};
