import axios from 'axios';
import { cacheData, getCachedData, addToSyncQueue } from './offlineDB';
import { processSync } from './syncManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Map API paths to IndexedDB store names
function getStoreName(url) {
  const clean = url.split('?')[0].replace(/^\//, '');
  if (clean.startsWith('deployment-plans')) return 'deployment-plans';
  if (clean.startsWith('incidents')) return 'incidents';
  if (clean.startsWith('assets')) return 'assets';
  if (clean.startsWith('maintenance')) return 'maintenance';
  if (clean.startsWith('users')) return 'users';
  if (clean.startsWith('dashboard')) return 'dashboard';
  return null;
}

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: cache successful GET responses, handle offline
api.interceptors.response.use(
  (response) => {
    // Cache successful GET list responses
    const method = response.config.method;
    const url = response.config.url;
    if (method === 'get' && response.data?.success) {
      const store = getStoreName(url);
      if (store) {
        cacheData(store, response.data).catch(() => {});
      }
    }
    return response;
  },
  async (error) => {
    // Handle 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If network error (offline), handle it
    if (!error.response && !navigator.onLine) {
      const config = error.config;
      const method = config.method?.toUpperCase();
      const url = config.url;

      // For GET requests: return cached data
      if (method === 'GET') {
        const store = getStoreName(url);
        if (store) {
          const cached = await getCachedData(store);
          if (cached) {
            return { data: { ...cached, _offline: true } };
          }
        }
      }

      // For mutations (POST/PUT/DELETE): queue for later sync
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        const data = config.data ? JSON.parse(config.data) : undefined;
        await addToSyncQueue({ method, url, data });
        return {
          data: { success: true, _queued: true, message: 'Saved offline, will sync when online' },
        };
      }
    }

    return Promise.reject(error);
  }
);

// Trigger sync when api module loads and we're online
if (navigator.onLine) {
  setTimeout(processSync, 3000);
}

export default api;
