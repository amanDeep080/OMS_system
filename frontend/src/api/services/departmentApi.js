import apiClient from '../axiosClient';

export const departmentApi = {
  list: () => apiClient.get('/departments'),
  getById: (id) => apiClient.get(`/departments/${id}`),
  create: (payload) => apiClient.post('/departments', payload),
  update: (id, payload) => apiClient.put(`/departments/${id}`, payload),
  remove: (id) => apiClient.delete(`/departments/${id}`),
};
