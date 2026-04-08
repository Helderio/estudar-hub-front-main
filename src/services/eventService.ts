import api from './api';

export const eventService = {
  getAll: (params?: Record<string, string>) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (payload: { title: string; description?: string; date: string; location: string; institutionId?: number; type?: string }) =>
    api.post('/events', payload),
  participate: (id: string) => api.post(`/events/${id}/participate`),
  leave: (id: string) => api.delete(`/events/${id}/participate`),
};
