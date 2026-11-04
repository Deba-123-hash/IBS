import apiClient from '../api/client.js';

export const accountsApi = {
  getDashboard: () => apiClient.get('/accounts/dashboard').then(r => r.data || r),
  getTransactions: (params) => apiClient.get('/accounts/transactions', { params }).then(r => r.data || r),
  getIncome: () => apiClient.get('/accounts/income').then(r => r.data || r),
  getExpenses: (params) => apiClient.get('/accounts/expenses', { params }).then(r => r.data || r),
  createExpense: (data) => apiClient.post('/accounts/expenses', data).then(r => r.data || r),
  updateExpense: (id, data) => apiClient.patch(`/accounts/expenses/${id}`, data).then(r => r.data || r),
  getBalance: () => apiClient.get('/accounts/balance').then(r => r.data || r),
  getReports: () => apiClient.get('/accounts/reports').then(r => r.data || r),
  getMonthlyReports: () => apiClient.get('/accounts/reports/monthly').then(r => r.data || r),
  getYearlyReports: () => apiClient.get('/accounts/reports/yearly').then(r => r.data || r),
  getReconciliation: (params) => apiClient.get('/accounts/reconciliation', { params }).then(r => r.data || r),
  createReconciliation: (data) => apiClient.post('/accounts/reconciliation', data).then(r => r.data || r)
};

export default accountsApi;
