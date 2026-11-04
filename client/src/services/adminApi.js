import apiClient from '../api/client.js';

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard').then(r => r.data || r),
  getUsers: (params) => apiClient.get('/admin/users', { params }).then(r => r.data || r),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`).then(r => r.data || r),
  createUser: (data) => apiClient.post('/admin/users', data).then(r => r.data || r),
  updateUser: (id, data) => apiClient.patch(`/admin/users/${id}`, data).then(r => r.data || r),
  updateUserStatus: (id, isActive) => apiClient.patch(`/admin/users/${id}/status`, { isActive }).then(r => r.data || r),
  updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }).then(r => r.data || r),
  getStudents: (params) => apiClient.get('/admin/students', { params }).then(r => r.data || r),
  getStudentById: (id) => apiClient.get(`/admin/students/${id}`).then(r => r.data || r),
  getNotices: (params) => apiClient.get('/admin/notices', { params }).then(r => r.data || r),
  createNotice: (data) => apiClient.post('/admin/notices', data).then(r => r.data || r),
  publishNotice: (id) => apiClient.post(`/admin/notices/${id}/publish`).then(r => r.data || r),
  deleteNotice: (id) => apiClient.delete(`/admin/notices/${id}`).then(r => r.data || r),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }).then(r => r.data || r)
};

export default adminApi;
