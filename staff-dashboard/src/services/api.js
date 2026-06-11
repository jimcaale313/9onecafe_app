import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('staffToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  async err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffRefreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
