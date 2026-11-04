import apiClient from '../api/client.js';

export const wardenApi = {
  getDashboard: () => apiClient.get('/warden/dashboard').then(r => r.data || r),
  getHostels: () => apiClient.get('/warden/hostels').then(r => r.data || r),
  getHostelById: (id) => apiClient.get(`/warden/hostels/${id}`).then(r => r.data || r),
  getRooms: (params) => apiClient.get('/warden/rooms', { params }).then(r => r.data || r),
  getRoomById: (id) => apiClient.get(`/warden/rooms/${id}`).then(r => r.data || r),
  allocateRoom: (data) => apiClient.post('/warden/room-allocations', data).then(r => r.data || r),
  deallocateRoom: (id) => apiClient.delete(`/warden/room-allocations/${id}`).then(r => r.data || r),
  getRoomTransfers: (params) => apiClient.get('/warden/room-transfers', { params }).then(r => r.data || r),
  approveRoomTransfer: (id) => apiClient.patch(`/warden/room-transfers/${id}/approve`).then(r => r.data || r),
  rejectRoomTransfer: (id, reason) => apiClient.patch(`/warden/room-transfers/${id}/reject`, { reason }).then(r => r.data || r),
  getLeaveRequests: (params) => apiClient.get('/warden/leave-requests', { params }).then(r => r.data || r),
  getLeaveRequestById: (id) => apiClient.get(`/warden/leave-requests/${id}`).then(r => r.data || r),
  approveLeaveRequest: (id) => apiClient.patch(`/warden/leave-requests/${id}/approve`).then(r => r.data || r),
  rejectLeaveRequest: (id, remarks) => apiClient.patch(`/warden/leave-requests/${id}/reject`, { remarks }).then(r => r.data || r),
  getComplaints: (params) => apiClient.get('/warden/complaints', { params }).then(r => r.data || r),
  assignComplaint: (id, staffId) => apiClient.patch(`/warden/complaints/${id}/assign`, { staffId }).then(r => r.data || r),
  updateComplaintStatus: (id, status, notes) => apiClient.patch(`/warden/complaints/${id}/status`, { status, notes }).then(r => r.data || r)
};

export default wardenApi;
