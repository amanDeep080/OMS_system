import apiClient from '../axiosClient';

export const performanceApi = {
  myReviews: () => apiClient.get('/performance/me'),
  employeeReviews: (employeeId) => apiClient.get(`/performance/employee/${employeeId}`),
  list: (params) => apiClient.get('/performance', { params }),
  create: (payload) => apiClient.post('/performance', payload),
  update: (id, payload) => apiClient.put(`/performance/${id}`, payload),
};
