import axios from 'axios';

const rawUrl = (import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');
export const adminApi = axios.create({ baseURL: `${rawUrl}/api` });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const analyticsAdminApi = {
  getOverview: (range = '30d') => adminApi.get(`/admin/analytics/overview?range=${range}`),
  getTraffic: (range = '7d') => adminApi.get(`/admin/analytics/traffic?range=${range}`),
  getPages: (range = '30d') => adminApi.get(`/admin/analytics/pages?range=${range}`),
  getPageDetail: (path: string, range = '30d') => adminApi.get('/admin/analytics/page-detail', { params: { path, range } }),
  getEvents: (range = '30d') => adminApi.get(`/admin/analytics/events?range=${range}`),
  getProjects: (range = '30d') => adminApi.get(`/admin/analytics/projects?range=${range}`),
  getSources: (range = '30d') => adminApi.get(`/admin/analytics/sources?range=${range}`),
  getDevices: (range = '30d') => adminApi.get(`/admin/analytics/devices?range=${range}`),
  getGeography: (range = '30d') => adminApi.get(`/admin/analytics/geography?range=${range}`),
  getRealtime: () => adminApi.get('/admin/analytics/realtime'),
  getVisitors: (page = 1, limit = 20) => adminApi.get(`/admin/analytics/visitors?page=${page}&limit=${limit}`),
  getVisitorDetail: (visitorId: string) => adminApi.get(`/admin/analytics/visitors/${visitorId}`),
  getResumeAnalytics: (range = '30d') => adminApi.get(`/admin/analytics/resume?range=${range}`),
  getRecentActivity: (limit = 50) => adminApi.get(`/admin/analytics/recent-activity?limit=${limit}`),
};
