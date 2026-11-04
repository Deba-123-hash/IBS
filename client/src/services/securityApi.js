import apiClient from '../api/client.js';

export const securityApi = {
  getDashboard: () => apiClient.get('/security/dashboard').then(r => r.data || r),
  gateEntry: (data) => apiClient.post('/security/gate/entry', data).then(r => r.data || r),
  gateExit: (data) => apiClient.post('/security/gate/exit', data).then(r => r.data || r),
  getGateLogs: (params) => apiClient.get('/security/gate/logs', { params }).then(r => r.data || r),
  getVisitors: (params) => apiClient.get('/security/visitors', { params }).then(r => r.data || r),
  getVisitorById: (id) => apiClient.get(`/security/visitors/${id}`).then(r => r.data || r),
  registerVisitor: (data) => apiClient.post('/security/visitors', data).then(r => r.data || r),
  updateVisitorStatus: (id, status) => apiClient.patch(`/security/visitors/${id}/status`, { status }).then(r => r.data || r),
  getEmergency: (params) => apiClient.get('/security/emergency', { params }).then(r => r.data || r),
  createEmergency: (data) => apiClient.post('/security/emergency', data).then(r => r.data || r),
  resolveEmergency: (id, actionTaken) => apiClient.patch(`/security/emergency/${id}/resolve`, { actionTaken }).then(r => r.data || r)
};

export default securityApi;
