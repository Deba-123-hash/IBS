import api from './api.js';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('campus_auth_token');
    localStorage.removeItem('campus_user');
  },

  getToken: () => localStorage.getItem('campus_auth_token'),
  getUser: () => {
    const raw = localStorage.getItem('campus_user');
    return raw ? JSON.parse(raw) : null;
  }
};

export default authService;
