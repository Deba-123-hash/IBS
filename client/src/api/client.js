import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
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

// Interceptor: response & error normalization
apiClient.interceptors.response.use(
  (response) => {
    // If enveloped { success: true, data: ... }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data;
    }
    return { success: true, data: response.data };
  },
  (error) => {
    const status = error.response?.status;
    const resData = error.response?.data;

    // 401: Session expired
    if (status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('campus_auth_token');
        localStorage.removeItem('campus_user');
      }
      return Promise.reject({
        status: 401,
        code: 'UNAUTHORIZED',
        message: resData?.message || 'Session expired. Please sign in again.'
      });
    }

    // 403: Forbidden / Permission Denied
    if (status === 403) {
      return Promise.reject({
        status: 403,
        code: resData?.error?.code || 'FORBIDDEN',
        message: resData?.message || 'You do not have permission to perform this action.'
      });
    }

    // Generic normalized error
    return Promise.reject({
      status: status || 500,
      code: resData?.error?.code || 'SERVER_ERROR',
      message: resData?.message || error.message || 'Something went wrong. Please try again.',
      details: resData?.error?.details
    });
  }
);

export default apiClient;
