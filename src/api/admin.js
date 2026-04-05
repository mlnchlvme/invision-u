import { api } from './client';

export const adminApi = {
  dashboard:  ()          => api.get('/api/dashboard'),
  stats:      ()          => api.get('/api/stats'),
  settings:   (data)      => api.put('/api/settings', data),
  seed:       ()          => api.post('/api/seed'),

  candidates: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.zone)     params.set('zone',      filters.zone);
    if (filters.status)   params.set('status',    filters.status);
    if (filters.program)  params.set('program',   filters.program);
    if (filters.page)     params.set('page',      filters.page);
    if (filters.per_page) params.set('page_size', filters.per_page);
    const qs = params.toString();
    return api.get(`/api/dashboard${qs ? `?${qs}` : ''}`);
  },

  candidate:  (appId)     => api.get(`/api/applications/${appId}/detail`),
  export:     ()          => api.get('/api/export/csv'),
};