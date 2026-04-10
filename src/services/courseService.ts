import api from './api';

export type CourseOption = {
  id: number;
  nome: string;
  area?: string;
};

export const courseService = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/courses', { params }),
};

