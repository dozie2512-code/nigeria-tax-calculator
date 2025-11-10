import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  invite: (data) => api.post('/auth/invite', data),
};

// Business services
export const businessService = {
  getAll: () => api.get('/businesses'),
  create: (data) => api.post('/businesses', data),
  getById: (id) => api.get(`/businesses/${id}`),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
};

// Chart of Accounts services
export const chartAccountService = {
  getAll: (businessId) => api.get('/chart-accounts', { params: { businessId } }),
  create: (data) => api.post('/chart-accounts', data),
  getById: (id) => api.get(`/chart-accounts/${id}`),
  update: (id, data) => api.put(`/chart-accounts/${id}`, data),
  delete: (id) => api.delete(`/chart-accounts/${id}`),
};

// Transaction services
export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  getById: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Inventory services
export const inventoryService = {
  getItems: (businessId) => api.get('/inventory/items', { params: { businessId } }),
  createItem: (data) => api.post('/inventory/items', data),
  purchase: (data) => api.post('/inventory/purchase', data),
  sale: (data) => api.post('/inventory/sale', data),
  getTransactions: (businessId) => api.get('/inventory/transactions', { params: { businessId } }),
};

// Fixed Asset services
export const fixedAssetService = {
  getAll: (businessId) => api.get('/fixed-assets', { params: { businessId } }),
  create: (data) => api.post('/fixed-assets', data),
  getById: (id) => api.get(`/fixed-assets/${id}`),
  update: (id, data) => api.put(`/fixed-assets/${id}`, data),
  delete: (id) => api.delete(`/fixed-assets/${id}`),
  dispose: (id, data) => api.post(`/fixed-assets/${id}/dispose`, data),
  calculateDepreciation: (businessId) => api.post('/fixed-assets/calculate-depreciation', { businessId }),
};

// Contact services
export const contactService = {
  getAll: (businessId) => api.get('/contacts', { params: { businessId } }),
  create: (data) => api.post('/contacts', data),
  getById: (id) => api.get(`/contacts/${id}`),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// Settings services
export const settingsService = {
  get: (businessId) => api.get('/settings', { params: { businessId } }),
  update: (businessId, data) => api.put('/settings', data, { params: { businessId } }),
};

// Report services
export const reportService = {
  getAccountingProfit: (params) => api.get('/reports/accounting-profit', { params }),
  getVAT: (params) => api.get('/reports/vat', { params }),
  getWHT: (params) => api.get('/reports/wht', { params }),
  getPAYE: (params) => api.get('/reports/paye', { params }),
  getCIT: (params) => api.get('/reports/cit', { params }),
  getPIT: (params) => api.get('/reports/pit', { params }),
};

// Bank Reconciliation services
export const bankReconciliationService = {
  uploadStatement: (formData) => api.post('/bank-reconciliation/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStatements: (businessId) => api.get('/bank-reconciliation/statements', { params: { businessId } }),
  match: (data) => api.post('/bank-reconciliation/match', data),
  unmatch: (id) => api.post(`/bank-reconciliation/unmatch/${id}`),
  getReport: (businessId) => api.get('/bank-reconciliation/report', { params: { businessId } }),
};

// File services
export const fileService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
