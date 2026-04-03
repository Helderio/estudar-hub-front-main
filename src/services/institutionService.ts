import api from './api';

export const institutionService = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/institutions', { params }),
  getById: (id: string) => api.get(`/institutions/${id}`),
};
