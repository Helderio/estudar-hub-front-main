import api from './api';

export const chatService = {
  getChats: () => api.get('/chats'),
  createChat: (userId: string) => api.post('/chats', { userId }),
  getChatById: (id: string) => api.get(`/chats/${id}`),
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId: string, content: string) => api.post(`/chats/${chatId}/messages`, { content }),
};
