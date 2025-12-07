/**
 * Axios instance với interceptor để tự động gắn JWT token
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động gắn JWT token
api.interceptors.request.use(
  (config) => {
    // Không gắn token cho các endpoint auth
    if (!config.url?.includes('/auth/')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      // Có thể redirect đến trang login ở đây
      console.warn('Token expired or invalid');
    }
    return Promise.reject(error);
  }
);

export default api;

