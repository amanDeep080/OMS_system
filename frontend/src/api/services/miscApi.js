import apiClient from '../axiosClient';

export const dashboardApi = {
  overview: () => apiClient.get('/dashboard/overview'),
};

export const reportsApi = {
  attendance: (params) => apiClient.get('/reports/attendance', { params }),
  payroll: (params) => apiClient.get('/reports/payroll', { params }),
  leave: (params) => apiClient.get('/reports/leave', { params }),
  departments: () => apiClient.get('/reports/departments'),
  employees: () => apiClient.get('/reports/employees'),
};

export const notificationApi = {
  list: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};
