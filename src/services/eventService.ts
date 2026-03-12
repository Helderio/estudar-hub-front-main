import api from './api';

export const eventService = {
  getAll: (params?: Record<string, string>) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  participate: (id: string) => api.post(`/events/${id}/participate`),
  leave: (id: string) => api.delete(`/events/${id}/participate`),
};
