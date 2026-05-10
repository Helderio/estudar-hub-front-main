import api from './api';

type ProjectPayload = FormData | Record<string, unknown>;

function toProjectFormData(data: ProjectPayload) {
  if (data instanceof FormData) return data;

  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (value instanceof Blob) {
      fd.append(key, value);
      return;
    }
    fd.append(key, String(value));
  });
  return fd;
}

export const projectService = {
  getAll: (params?: Record<string, string>) => api.get('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  // For FormData in browsers, do not set Content-Type manually; Axios will add the boundary.
  create: (data: ProjectPayload) => api.post('/projects', toProjectFormData(data)),
  update: (id: string, data: ProjectPayload) => api.put(`/projects/${id}`, toProjectFormData(data)),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addComment: (id: string, content: string) => api.post(`/projects/${id}/comments`, { content }),
};
