import apiClient from '../axiosClient';

export const announcementApi = {
  list: (params) => apiClient.get('/announcements', { params }),
  getById: (id) => apiClient.get(`/announcements/${id}`),
  create: (payload) => apiClient.post('/announcements', payload),
  update: (id, payload) => apiClient.put(`/announcements/${id}`, payload),
  remove: (id) => apiClient.delete(`/announcements/${id}`),
};
