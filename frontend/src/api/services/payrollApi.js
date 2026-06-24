import apiClient from '../axiosClient';

export const payrollApi = {
  myPayroll: () => apiClient.get('/payroll/me'),
  getPayslip: (id) => apiClient.get(`/payroll/${id}`),
  employeePayroll: (employeeId, params) => apiClient.get(`/payroll/employee/${employeeId}`, { params }),
  monthlyCost: (months) => apiClient.get('/payroll/stats/monthly-cost', { params: { months } }),
  departmentDistribution: (params) => apiClient.get('/payroll/stats/department-distribution', { params }),
  salaryTrends: () => apiClient.get('/payroll/stats/salary-trends'),
  generate: (month, year) => apiClient.post('/payroll/generate', { month, year }),
};
