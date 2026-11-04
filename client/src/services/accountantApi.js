import apiClient from '../api/client.js';

export const accountantApi = {
  getDashboard: () => apiClient.get('/accountant/dashboard').then(r => r.data || r),
  getFees: (params) => apiClient.get('/accountant/fees', { params }).then(r => r.data || r),
  createFee: (data) => apiClient.post('/accountant/fees', data).then(r => r.data || r),
  getFeeById: (id) => apiClient.get(`/accountant/fees/${id}`).then(r => r.data || r),
  updateFee: (id, data) => apiClient.patch(`/accountant/fees/${id}`, data).then(r => r.data || r),
  getStudentFees: (studentId) => apiClient.get(`/accountant/students/${studentId}/fees`).then(r => r.data || r),
  getStudentDues: (studentId) => apiClient.get(`/accountant/students/${studentId}/dues`).then(r => r.data || r),
  getPayments: (params) => apiClient.get('/accountant/payments', { params }).then(r => r.data || r),
  getPaymentById: (id) => apiClient.get(`/accountant/payments/${id}`).then(r => r.data || r),
  recordPayment: (data) => apiClient.post('/accountant/payments', data).then(r => r.data || r),
  verifyPayment: (id) => apiClient.post(`/accountant/payments/${id}/verify`).then(r => r.data || r),
  rejectPayment: (id, reason) => apiClient.post(`/accountant/payments/${id}/reject`, { reason }).then(r => r.data || r),
  getReceipt: (id) => apiClient.get(`/accountant/payments/${id}/receipt`).then(r => r.data || r)
};

export default accountantApi;
