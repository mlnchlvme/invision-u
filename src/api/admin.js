import { api } from './client';

export const adminApi = {
  dashboard: ()      => api.get('/api/dashboard'),
  stats:     ()      => api.get('/api/stats'),
  settings:  (data)  => api.put('/api/settings', data),
  seed:      ()      => api.post('/api/seed'),
};
