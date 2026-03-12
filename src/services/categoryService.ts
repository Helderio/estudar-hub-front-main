import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
};
