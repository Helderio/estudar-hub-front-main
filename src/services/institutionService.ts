import api from './api';

export const institutionService = {
  getAll: () => api.get('/institutions'),
  getById: (id: string) => api.get(`/institutions/${id}`),
};
