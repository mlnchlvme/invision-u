import { api } from './client';

export const applicationsApi = {
  create:        (data)           => api.post('/api/applications', data),
  updateDocs:    (appId, data)    => api.put(`/api/applications/${appId}/documents`, data),
  updateAnswers: (appId, data)    => api.put(`/api/applications/${appId}/answers`, data),
  updateVideo:   (appId, data)    => api.put(`/api/applications/${appId}/video`, data),
  submit:        (appId)          => api.post(`/api/applications/${appId}/submit`),
  getStatus:     (appId)          => api.get(`/api/applications/${appId}/status`),
  getDetail:     (appId)          => api.get(`/api/applications/${appId}/detail`),
  getVideoQs:    (appId)          => api.get(`/api/applications/${appId}/video-questions`),
  makeDecision:  (appId, data)    => api.post(`/api/applications/${appId}/decision`, data),
};
