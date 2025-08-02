import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const pettyCashAPI = {
    // Petty Cash Book Management
    getAllBooks: (params = {}) => handleApiResponse(apiClient.get(API_ENDPOINTS.PETTY_CASH_BOOK, { params })),
    getBookById: (id) => handleApiResponse(apiClient.get(API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(id))),
    createBook: (bookData) => handleApiResponse(apiClient.post(API_ENDPOINTS.PETTY_CASH_BOOK, bookData)),
    updateBook: (id, bookData) => handleApiResponse(apiClient.put(API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(id), bookData)),
    closeBook: (id) => handleApiResponse(apiClient.put(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(id)}/close`)),

    // Petty Cash Expenses
    getAllExpenses: (params = {}) => handleApiResponse(apiClient.get(API_ENDPOINTS.PETTY_CASH_EXPENSES, { params })),
    getExpenseById: (id) => handleApiResponse(apiClient.get(API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id))),
    createExpense: (expenseData) => handleApiResponse(apiClient.post(API_ENDPOINTS.PETTY_CASH_EXPENSES, expenseData)),
    updateExpense: (id, expenseData) => handleApiResponse(apiClient.put(API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id), expenseData)),
    deleteExpense: (id) => handleApiResponse(apiClient.delete(API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id))),

    // Replenishment Requests
    getAllReplenishments: (params = {}) => handleApiResponse(apiClient.get(API_ENDPOINTS.REPLENISHMENT_REQUESTS, { params })),
    getReplenishmentById: (id) => handleApiResponse(apiClient.get(API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id))),
    createReplenishment: (replenishmentData) => handleApiResponse(apiClient.post(API_ENDPOINTS.REPLENISHMENT_REQUESTS, replenishmentData)),
    updateReplenishment: (id, replenishmentData) => handleApiResponse(apiClient.put(API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id), replenishmentData)),
    approveReplenishment: (id, approvalData) => handleApiResponse(apiClient.put(API_ENDPOINTS.REPLENISHMENT_APPROVE(id), approvalData)),
    rejectReplenishment: (id, rejectionData) => handleApiResponse(apiClient.put(`${API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id)}/reject`, rejectionData)),
    resubmitReplenishment: (id) => handleApiResponse(apiClient.put(`${API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id)}/resubmit`)),

    // Approval Workflow
    getReplenishmentApprovalQueue: (params = {}) => handleApiResponse(apiClient.get(`${API_ENDPOINTS.REPLENISHMENT_REQUESTS}/approval-queue`, { params })),
    getReplenishmentWorkflowStatus: (id) => handleApiResponse(apiClient.get(`${API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id)}/workflow`)),
    getExpenseApprovalQueue: (params = {}) => handleApiResponse(apiClient.get(`${API_ENDPOINTS.PETTY_CASH_EXPENSES}/approval-queue`, { params })),
    getExpenseWorkflowStatus: (id) => handleApiResponse(apiClient.get(`${API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)}/workflow`)),
    approveExpense: (id, approvalData) => handleApiResponse(apiClient.put(`${API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)}/approve`, approvalData)),
    rejectExpense: (id, rejectionData) => handleApiResponse(apiClient.put(`${API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)}/reject`, rejectionData)),
    resubmitExpense: (id) => handleApiResponse(apiClient.put(`${API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)}/resubmit`)),

    // Analytics & Reports
    getPettyCashSummary: (params = {}) => handleApiResponse(apiClient.get(`${API_ENDPOINTS.PETTY_CASH}/summary`, { params }))
};

const handleApiResponse = (apiCall) => {
    return apiCall.then(response => {
        // The backend sends data in response.data
        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message
        };
    }).catch(error => {
        throw new Error(error.response?.data?.message || error.message || 'API call failed');
    });
};