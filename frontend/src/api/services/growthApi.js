import apiClient from '../axiosClient';

export const growthApi = {
  listRecognitions: () => apiClient.get('/social/recognitions'),
  giveKudos: (data) => apiClient.post('/social/recognitions', data),
  getCareerPath: () => apiClient.get('/career/path'),
  listJobs: () => apiClient.get('/career/jobs'),
  listCourses: () => apiClient.get('/learning/courses'),
  enroll: (id) => apiClient.post(`/learning/courses/${id}/enroll`),
};
