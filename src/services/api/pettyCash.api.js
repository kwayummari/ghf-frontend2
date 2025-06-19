import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const pettyCashAPI = {
    // Petty Cash Book Management
    getAllBooks: (params = {}) => apiClient.get(API_ENDPOINTS.PETTY_CASH_BOOK, { params }),
    getBookById: (id) => apiClient.get(API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(id)),
    createBook: (bookData) => apiClient.post(API_ENDPOINTS.PETTY_CASH_BOOK, bookData),
    updateBook: (id, bookData) => apiClient.put(API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(id), bookData),
    closeBook: (id) => apiClient.put(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(id)}/close`),

    // Petty Cash Expenses
    getAllExpenses: (params = {}) => apiClient.get(API_ENDPOINTS.PETTY_CASH_EXPENSES, { params }),
    getExpenseById: (id) => apiClient.get(API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)),
    createExpense: (expenseData) => apiClient.post(API_ENDPOINTS.PETTY_CASH_EXPENSES, expenseData),
    updateExpense: (id, expenseData) => apiClient.put(API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id), expenseData),
    deleteExpense: (id) => apiClient.delete(API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)),
    approveExpense: (id) => apiClient.put(`${API_ENDPOINTS.PETTY_CASH_EXPENSE_BY_ID(id)}/approve`),

    // Expenses by Book
    getExpensesByBook: (bookId, params = {}) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(bookId)}/expenses`, { params }),

    // Replenishment Requests
    getAllReplenishments: (params = {}) => apiClient.get(API_ENDPOINTS.REPLENISHMENT_REQUESTS, { params }),
    getReplenishmentById: (id) => apiClient.get(API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id)),
    createReplenishment: (replenishmentData) => apiClient.post(API_ENDPOINTS.REPLENISHMENT_REQUESTS, replenishmentData),
    updateReplenishment: (id, replenishmentData) => apiClient.put(API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id), replenishmentData),
    approveReplenishment: (id, approvalData) => apiClient.put(API_ENDPOINTS.REPLENISHMENT_APPROVE(id), approvalData),
    rejectReplenishment: (id, rejectionData) => apiClient.put(`${API_ENDPOINTS.REPLENISHMENT_REQUEST_BY_ID(id)}/reject`, rejectionData),

    // Analytics & Reports
    getPettyCashSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH}/summary`, { params }),
    getExpenseCategories: () => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_EXPENSES}/categories`),
    getExpensesByCategory: (params = {}) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_EXPENSES}/by-category`, { params }),
    getMonthlyExpenseReport: (year, month) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_EXPENSES}/monthly/${year}/${month}`),

    // Balance & Float Management
    checkBalance: (bookId) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(bookId)}/balance`),
    updateFloat: (bookId, floatData) => apiClient.put(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(bookId)}/float`, floatData),
    getBalanceAlert: (bookId) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(bookId)}/alert`),

    // Export Functions
    exportPettyCashReport: (params = {}) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH}/export`, {
        params,
        responseType: 'blob'
    }),
    exportExpenses: (bookId, params = {}) => apiClient.get(`${API_ENDPOINTS.PETTY_CASH_BOOK_BY_ID(bookId)}/export-expenses`, {
        params,
        responseType: 'blob'
    }),
};