import apiClient from '../api/client.js';

export const maintenanceApi = {
  getDashboard: () => apiClient.get('/maintenance/dashboard').then(r => r.data || r),
  getWorkQueue: () => apiClient.get('/work-queue').then(r => r.data || r),
  getComplaints: (params) => apiClient.get('/complaints', { params }).then(r => r.data || r),
  getComplaintById: (id) => apiClient.get(`/complaints/${id}`).then(r => r.data || r),
  updateStatus: (id, status, notes) => apiClient.patch(`/complaints/${id}/status`, { status, notes }).then(r => r.data || r),
  addComment: (id, comment) => apiClient.post(`/complaints/${id}/comments`, { comment }).then(r => r.data || r)
};

export default maintenanceApi;

