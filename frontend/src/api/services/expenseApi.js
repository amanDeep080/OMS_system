import API from '../axiosClient';

export const expenseApi = {
  list: () => API.get('/expenses'),
  create: (data) => API.post('/expenses', data),
  approve: (id, data) => API.patch(`/expenses/${id}/approve`, data),
};
