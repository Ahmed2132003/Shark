import axios from 'axios';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) || localStorage.getItem('access');
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || localStorage.getItem('refresh');
}

export function persistTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.removeItem('access');
  }

  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.removeItem('refresh');
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,  
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    const refresh = getRefreshToken();

    if (!refresh) {
      throw new Error('Missing refresh token');
    }

    refreshPromise = api
      .post('/auth/token/refresh/', { refresh })      
      .then((response) => {
        const nextAccess = response?.data?.access;
        if (!nextAccess) {
          throw new Error('Refresh endpoint did not return access token');
        }

        persistTokens({ access: nextAccess, refresh });
        return nextAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || '';
    const isRefreshCall = requestUrl.includes('/auth/token/refresh/');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;