import axios from 'axios';
import { store } from '../../store/store';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch({ type: 'auth/logout' });
      window.location.href = '/login';
    }
    if (error.message === 'Network Error') {
      console.error('CORS or network error occurred');
      // Handle CORS error (e.g., show user-friendly message)
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 