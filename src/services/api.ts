import axios from 'axios';

function getBaseUrl() {
  // Prefer explicit build-time config.
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl;

  // In prod on Vercel we can rely on rewrites: /api -> Render backend.
  if (import.meta.env.PROD) return '/api';

  // Local dev default.
  return 'http://localhost:8080/api';
}

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
