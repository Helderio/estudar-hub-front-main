import api from './api';

export const notificationService = {
  getNotifications: (unreadOnly = false) =>
    api.get('/notifications', { params: { unreadOnly } }),
  getCount: () => api.get('/notifications/count'),
  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
