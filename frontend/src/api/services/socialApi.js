import apiClient from '../axiosClient';

export const socialApi = {
  listPosts: (params) => apiClient.get('/social/posts', { params }),
  createPost: (data) => apiClient.post('/social/posts', data),
  likePost: (id) => apiClient.post(`/social/posts/${id}/like`),
  addComment: (id, data) => apiClient.post(`/social/posts/${id}/comments`, data),
};
