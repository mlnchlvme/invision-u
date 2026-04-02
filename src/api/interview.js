import { api } from './client';

export const interviewApi = {
  start:   (appId)           => api.post(`/api/interview/${appId}/start`),
  message: (interviewId, text) => api.post(`/api/interview/${interviewId}/message`, { text }),
};
