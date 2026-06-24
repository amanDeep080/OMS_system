import axios from 'axios';
import { store } from '../app/store';
import { setAccessToken, logout } from '../features/auth/authSlice';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // If it's a 401 and not a retry, and not already on the login page
    if (response?.status === 401 && !config._retried && !window.location.pathname.includes('/login')) {
      const refreshToken = store.getState().auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config });
        });
      }

      isRefreshing = true;
      config._retried = true;

      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const newAccessToken = data.data.accessToken;

        store.dispatch(setAccessToken(newAccessToken));

        pendingQueue.forEach((p) => {
          p.config.headers.Authorization = `Bearer ${newAccessToken}`;
          p.resolve(apiClient(p.config));
        });
        pendingQueue = [];

        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        pendingQueue.forEach((p) => p.reject(refreshError));
        pendingQueue = [];
        store.dispatch(logout());
        // Force redirect to login if refresh fails
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
