import apiClient from '../axiosClient';

export const employeeApi = {
  list: (params) => apiClient.get('/employees', { params }),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (payload) => apiClient.post('/employees', payload),
  update: (id, payload) => apiClient.put(`/employees/${id}`, payload),
  deactivate: (id) => apiClient.delete(`/employees/${id}`),
  getDirectReports: (id) => apiClient.get(`/employees/${id}/team`),
};
