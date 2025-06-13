import apiClient from './axios.config';

export const financeAPI = {
    // Budgets
    getBudgets: (params = {}) => apiClient.get('/finance/budgets', { params }),
    createBudget: (data) => apiClient.post('/finance/budgets', data),
    updateBudget: (id, data) => apiClient.put(`/finance/budgets/${id}`, data),
    deleteBudget: (id) => apiClient.delete(`/finance/budgets/${id}`),

    // Assets
    getAssets: (params = {}) => apiClient.get('/finance/assets', { params }),
    createAsset: (data) => apiClient.post('/finance/assets', data),
    updateAsset: (id, data) => apiClient.put(`/finance/assets/${id}`, data),
    deleteAsset: (id) => apiClient.delete(`/finance/assets/${id}`),

    // Requisitions
    getRequisitions: (params = {}) => apiClient.get('/finance/requisitions', { params }),
    createRequisition: (data) => apiClient.post('/finance/requisitions', data),
    updateRequisition: (id, data) => apiClient.put(`/finance/requisitions/${id}`, data),
    approveRequisition: (id, data) => apiClient.put(`/finance/requisitions/${id}/approve`, data),
    rejectRequisition: (id, data) => apiClient.put(`/finance/requisitions/${id}/reject`, data),
};