import API from '../axiosClient';

export const assetApi = {
  list: () => API.get('/assets'),
  create: (data) => API.post('/assets', data),
  assign: (id, employeeId) => API.patch(`/assets/${id}/assign`, { employeeId }),
};
