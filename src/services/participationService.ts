import api from './api';

export const participationService = {
  requestParticipation: (projectId: string) => api.post(`/projects/${projectId}/participate`),
  invite: (projectId: string, userId: string) => api.post(`/projects/${projectId}/invite`, { userId }),
  acceptInvite: (invitationId: string) => api.put(`/invitations/${invitationId}/accept`),
  rejectInvite: (invitationId: string) => api.put(`/invitations/${invitationId}/reject`),
  getMyInvitations: () => api.get('/invitations/me'),
};
