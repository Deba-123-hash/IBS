import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: inject Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('campus_auth_token');
        localStorage.removeItem('campus_user');
      }
    }
    return Promise.reject(error.response?.data?.error || { message: error.message || 'Network Error' });
  }
);

export default apiClient;
