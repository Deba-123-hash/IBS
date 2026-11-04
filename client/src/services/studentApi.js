import apiClient from '../api/client.js';

export const studentApi = {
  getDashboard: () => apiClient.get('/student/dashboard').then(r => r.data || r),
  getProfile: () => apiClient.get('/student/profile').then(r => r.data || r),
  updateProfile: (data) => apiClient.patch('/student/profile', data).then(r => r.data || r),
  getAttendance: (params) => apiClient.get('/student/attendance', { params }).then(r => r.data || r),
  getAttendanceSummary: () => apiClient.get('/student/attendance/summary').then(r => r.data || r),
  getHostel: () => apiClient.get('/student/hostel').then(r => r.data || r),
  getRoom: () => apiClient.get('/student/room').then(r => r.data || r),
  requestRoomTransfer: (data) => apiClient.post('/student/room-transfer-request', data).then(r => r.data || r),
  getLeaveRequests: (params) => apiClient.get('/student/leave-requests', { params }).then(r => r.data || r),
  createLeaveRequest: (data) => apiClient.post('/student/leave-requests', data).then(r => r.data || r),
  cancelLeaveRequest: (id) => apiClient.delete(`/student/leave-requests/${id}`).then(r => r.data || r),
  getComplaints: (params) => apiClient.get('/student/complaints', { params }).then(r => r.data || r),
  createComplaint: (data) => apiClient.post('/student/complaints', data).then(r => r.data || r),
  getFees: () => apiClient.get('/student/fees').then(r => r.data || r),
  getFeeSummary: () => apiClient.get('/student/fees/summary').then(r => r.data || r),
  getPayments: () => apiClient.get('/student/payments').then(r => r.data || r),
  getVisitorRequests: (params) => apiClient.get('/student/visitor-requests', { params }).then(r => r.data || r),
  createVisitorRequest: (data) => apiClient.post('/student/visitor-requests', data).then(r => r.data || r),
  cancelVisitorRequest: (id) => apiClient.patch(`/student/visitor-requests/${id}/cancel`).then(r => r.data || r)
};

export default studentApi;
