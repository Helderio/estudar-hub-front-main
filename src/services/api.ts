import axios from 'axios';

function getBaseUrl() {
  // Prefer explicit build-time config.
  const envUrl = import.meta.env.VITE_API_URL;
  // In production we strongly prefer same-origin proxy (/api) so cookies work reliably.
  // If you set VITE_API_URL in Vercel, set it to "/api" (not an absolute backend URL).
  if (import.meta.env.PROD) {
    if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('/')) return envUrl;
    return '/api';
  }

  if (envUrl && typeof envUrl === 'string') return envUrl;

  // In prod on Vercel we can rely on rewrites: /api -> Render backend.
  // Local dev default.
  return 'http://localhost:8080/api';
}

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  // Session-based auth uses cookies.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // JWT removed: auth is handled by HttpSession cookie (JSESSIONID).
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired / missing cookie: clear local cached user and force re-login.
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
