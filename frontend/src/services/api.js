import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  invite: (businessId, email, role) => api.post('/auth/invite', { businessId, email, role }),
};

export const businessService = {
  getAll: () => api.get('/businesses'),
  getSettings: (businessId) => api.get(`/businesses/${businessId}/settings`),
  updateSettings: (businessId, data) => api.put(`/businesses/${businessId}/settings`, data),
};

export const chartAccountService = {
  getAll: (businessId) => api.get(`/businesses/${businessId}/chart-accounts`),
  create: (businessId, data) => api.post(`/businesses/${businessId}/chart-accounts`, data),
  update: (businessId, id, data) => api.put(`/businesses/${businessId}/chart-accounts/${id}`, data),
  delete: (businessId, id) => api.delete(`/businesses/${businessId}/chart-accounts/${id}`),
};

export const transactionService = {
  getAll: (businessId, params) => api.get(`/businesses/${businessId}/transactions`, { params }),
  getOne: (businessId, id) => api.get(`/businesses/${businessId}/transactions/${id}`),
  create: (businessId, data) => api.post(`/businesses/${businessId}/transactions`, data),
  update: (businessId, id, data) => api.put(`/businesses/${businessId}/transactions/${id}`, data),
  delete: (businessId, id) => api.delete(`/businesses/${businessId}/transactions/${id}`),
};

export const inventoryService = {
  getAll: (businessId) => api.get(`/businesses/${businessId}/inventory`),
  create: (businessId, data) => api.post(`/businesses/${businessId}/inventory`, data),
  purchase: (businessId, id, data) => api.post(`/businesses/${businessId}/inventory/${id}/purchase`, data),
  sale: (businessId, id, data) => api.post(`/businesses/${businessId}/inventory/${id}/sale`, data),
  setOpeningBalance: (businessId, id, data) => api.post(`/businesses/${businessId}/inventory/${id}/opening-balance`, data),
  getTransactions: (businessId, id) => api.get(`/businesses/${businessId}/inventory/${id}/transactions`),
};

export const fixedAssetService = {
  getAll: (businessId) => api.get(`/businesses/${businessId}/fixed-assets`),
  getOne: (businessId, id) => api.get(`/businesses/${businessId}/fixed-assets/${id}`),
  create: (businessId, data) => api.post(`/businesses/${businessId}/fixed-assets`, data),
  update: (businessId, id, data) => api.put(`/businesses/${businessId}/fixed-assets/${id}`, data),
  dispose: (businessId, id, data) => api.post(`/businesses/${businessId}/fixed-assets/${id}/dispose`, data),
  runDepreciation: (businessId) => api.post(`/businesses/${businessId}/fixed-assets/depreciation/run`),
};

export const contactService = {
  getAll: (businessId) => api.get(`/businesses/${businessId}/contacts`),
  create: (businessId, data) => api.post(`/businesses/${businessId}/contacts`, data),
  update: (businessId, id, data) => api.put(`/businesses/${businessId}/contacts/${id}`, data),
  delete: (businessId, id) => api.delete(`/businesses/${businessId}/contacts/${id}`),
};

export const reportService = {
  getAccountingProfit: (businessId, params) => api.get(`/businesses/${businessId}/reports/accounting-profit`, { params }),
  getCIT: (businessId, params) => api.get(`/businesses/${businessId}/reports/cit`, { params }),
  getPIT: (businessId, params) => api.get(`/businesses/${businessId}/reports/pit`, { params }),
  getVAT: (businessId, params) => api.get(`/businesses/${businessId}/reports/vat`, { params }),
  getWHT: (businessId, params) => api.get(`/businesses/${businessId}/reports/wht`, { params }),
  getPAYE: (businessId, params) => api.get(`/businesses/${businessId}/reports/paye`, { params }),
  exportExcel: (businessId, reportType, params) => 
    api.get(`/businesses/${businessId}/reports/${reportType}/export/excel`, { 
      params, 
      responseType: 'blob' 
    }),
  exportPDF: (businessId, reportType, params) => 
    api.get(`/businesses/${businessId}/reports/${reportType}/export/pdf`, { 
      params, 
      responseType: 'blob' 
    }),
};

export const fileService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const reconciliationService = {
  uploadBankStatement: (businessId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/businesses/${businessId}/reconciliation/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getBankTransactions: (businessId) => api.get(`/businesses/${businessId}/reconciliation/bank-transactions`),
  autoMatch: (businessId) => api.post(`/businesses/${businessId}/reconciliation/auto-match`),
  manualMatch: (businessId, data) => api.post(`/businesses/${businessId}/reconciliation/manual-match`, data),
  unmatch: (businessId, reconciliationId) => api.delete(`/businesses/${businessId}/reconciliation/unmatch/${reconciliationId}`),
};

export default api;
