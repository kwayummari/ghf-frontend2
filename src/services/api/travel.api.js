import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const travelAPI = {
    // Travel Requests
    getAllRequests: (params = {}) => apiClient.get(API_ENDPOINTS.TRAVEL_REQUESTS, { params }),
    getRequestById: (id) => apiClient.get(API_ENDPOINTS.TRAVEL_REQUEST_BY_ID(id)),
    createRequest: (requestData) => apiClient.post(API_ENDPOINTS.TRAVEL_REQUESTS, requestData),
    updateRequest: (id, requestData) => apiClient.put(API_ENDPOINTS.TRAVEL_REQUEST_BY_ID(id), requestData),
    deleteRequest: (id) => apiClient.delete(API_ENDPOINTS.TRAVEL_REQUEST_BY_ID(id)),
    approveRequest: (id, approvalData) => apiClient.put(API_ENDPOINTS.TRAVEL_APPROVE(id), approvalData),
    rejectRequest: (id, rejectionData) => apiClient.put(`${API_ENDPOINTS.TRAVEL_REQUEST_BY_ID(id)}/reject`, rejectionData),

    // Travel Advances
    getAllAdvances: (params = {}) => apiClient.get(API_ENDPOINTS.TRAVEL_ADVANCES, { params }),
    getAdvanceById: (id) => apiClient.get(API_ENDPOINTS.TRAVEL_ADVANCE_BY_ID(id)),
    createAdvance: (advanceData) => apiClient.post(API_ENDPOINTS.TRAVEL_ADVANCES, advanceData),
    updateAdvance: (id, advanceData) => apiClient.put(API_ENDPOINTS.TRAVEL_ADVANCE_BY_ID(id), advanceData),
    processAdvance: (requestId, advanceData) => apiClient.post(`${API_ENDPOINTS.TRAVEL_ADVANCES}/process/${requestId}`, advanceData),
    retireAdvance: (id, retirementData) => apiClient.put(API_ENDPOINTS.TRAVEL_RETIRE(id), retirementData),

    // Expense Reports
    getAllExpenseReports: (params = {}) => apiClient.get(API_ENDPOINTS.EXPENSE_REPORTS, { params }),
    getExpenseReportById: (id) => apiClient.get(API_ENDPOINTS.EXPENSE_REPORT_BY_ID(id)),
    createExpenseReport: (reportData) => apiClient.post(API_ENDPOINTS.EXPENSE_REPORTS, reportData),
    updateExpenseReport: (id, reportData) => apiClient.put(API_ENDPOINTS.EXPENSE_REPORT_BY_ID(id), reportData),
    submitExpenseReport: (id) => apiClient.put(`${API_ENDPOINTS.EXPENSE_REPORT_BY_ID(id)}/submit`),
    approveExpenseReport: (id, approvalData) => apiClient.put(`${API_ENDPOINTS.EXPENSE_REPORT_BY_ID(id)}/approve`, approvalData),

    // Flat Rates
    getFlatRates: () => apiClient.get(API_ENDPOINTS.FLAT_RATES),
    getFlatRateById: (id) => apiClient.get(`${API_ENDPOINTS.FLAT_RATES}/${id}`),
    createFlatRate: (rateData) => apiClient.post(API_ENDPOINTS.FLAT_RATES, rateData),
    updateFlatRate: (id, rateData) => apiClient.put(`${API_ENDPOINTS.FLAT_RATES}/${id}`, rateData),

    // Reports & Analytics
    getTravelReports: (params = {}) => apiClient.get(`${API_ENDPOINTS.TRAVEL_REQUESTS}/reports`, { params }),
    getAdvanceReports: (params = {}) => apiClient.get(`${API_ENDPOINTS.TRAVEL_ADVANCES}/reports`, { params }),
    getExpenseAnalytics: (params = {}) => apiClient.get(`${API_ENDPOINTS.EXPENSE_REPORTS}/analytics`, { params }),

    // Export Functions
    exportTravelRequests: (params = {}) => apiClient.get(`${API_ENDPOINTS.TRAVEL_REQUESTS}/export`, {
        params,
        responseType: 'blob'
    }),
    exportExpenseReports: (params = {}) => apiClient.get(`${API_ENDPOINTS.EXPENSE_REPORTS}/export`, {
        params,
        responseType: 'blob'
    }),
};