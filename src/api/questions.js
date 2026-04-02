import { api } from './client';

export const questionsApi = {
  list:   (program) => api.get(`/api/questions${program ? `?program=${program}` : ''}`),
  create: (data)    => api.post('/api/questions', data),
  update: (id, data)=> api.put(`/api/questions/${id}`, data),
  remove: (id)      => api.delete(`/api/questions/${id}`),
};
