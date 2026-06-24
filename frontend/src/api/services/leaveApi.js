import apiClient from '../axiosClient';

export const leaveApi = {
  apply: (payload) => apiClient.post('/leaves', payload),
  myLeaves: () => apiClient.get('/leaves/me'),
  list: (params) => apiClient.get('/leaves', { params }),
  decide: (id, status, decisionNote) => apiClient.patch(`/leaves/${id}/decision`, { status, decisionNote }),
  cancel: (id) => apiClient.patch(`/leaves/${id}/cancel`),
  balance: (employeeId) => apiClient.get(`/leaves/balance/${employeeId}`),
};
