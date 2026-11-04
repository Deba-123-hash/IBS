import apiClient from '../api/client.js';

export const facultyApi = {
  getDashboard: () => apiClient.get('/faculty/dashboard').then(r => r.data || r),
  getClasses: () => apiClient.get('/faculty/classes').then(r => r.data || r),
  getStudents: (params) => apiClient.get('/faculty/students', { params }).then(r => r.data || r),
  getAttendance: (params) => apiClient.get('/attendance', { params }).then(r => r.data || r),
  saveAttendance: (data) => apiClient.post('/faculty/attendance', data).then(r => r.data || r),
  endorseLeave: (id, decision, remarks) => apiClient.patch(`/faculty/leaves/${id}/endorse`, { decision, remarks }).then(r => r.data || r)
};

export const notificationApi = {
  getNotifications: (params) => apiClient.get('/notifications', { params }).then(r => r.data || r),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data || r),
  markAllAsRead: () => apiClient.patch('/notifications/read-all').then(r => r.data || r),
  dismissNotification: (id) => apiClient.delete(`/notifications/${id}`).then(r => r.data || r)
};

export default { facultyApi, notificationApi };
