import api from './api';

export type UpdateMePayload = {
  nome: string;
  email: string;
  telefone: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  curso?: string;
  anoAcademico?: string;
  institutionId?: number;
};

export const profileService = {
  getMe: () => api.get('/profile/me'),
  updateMe: (payload: UpdateMePayload) => api.put('/profile/me', payload),
};

