import apiClient from '../axiosClient';

export const attendanceApi = {
  checkIn: () => apiClient.post('/attendance/check-in'),
  checkOut: () => apiClient.post('/attendance/check-out'),
  myAttendance: (params) => apiClient.get('/attendance/me', { params }),
  employeeAttendance: (employeeId, params) => apiClient.get(`/attendance/employee/${employeeId}`, { params }),
  teamToday: (managerId) => apiClient.get(`/attendance/team/${managerId}`),
  statsToday: () => apiClient.get('/attendance/stats/today'),
  trends: (months) => apiClient.get('/attendance/stats/trends', { params: { months } }),
};
