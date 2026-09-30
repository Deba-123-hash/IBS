import apiClient from '../api/client.js';

export const api = {
  get: (url, params = {}) => apiClient.get(url, { params }),
  post: (url, data = {}) => apiClient.post(url, data),
  put: (url, data = {}) => apiClient.put(url, data),
  patch: (url, data = {}) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url)
};

export default api;
