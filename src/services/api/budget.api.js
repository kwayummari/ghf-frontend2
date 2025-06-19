import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const budgetAPI = {
    // Budget Management
    getAllBudgets: (params = {}) => apiClient.get(API_ENDPOINTS.BUDGETS, { params }),
    getBudgetById: (id) => apiClient.get(API_ENDPOINTS.BUDGET_BY_ID(id)),
    createBudget: (budgetData) => apiClient.post(API_ENDPOINTS.BUDGETS, budgetData),
    updateBudget: (id, budgetData) => apiClient.put(API_ENDPOINTS.BUDGET_BY_ID(id), budgetData),
    deleteBudget: (id) => apiClient.delete(API_ENDPOINTS.BUDGET_BY_ID(id)),
    copyBudget: (id, copyData) => apiClient.post(`${API_ENDPOINTS.BUDGET_BY_ID(id)}/copy`, copyData),

    // Budget Planning
    getBudgetPlanning: (params = {}) => apiClient.get(API_ENDPOINTS.BUDGET_PLANNING, { params }),
    createBudgetPlan: (planData) => apiClient.post(API_ENDPOINTS.BUDGET_PLANNING, planData),
    updateBudgetPlan: (id, planData) => apiClient.put(`${API_ENDPOINTS.BUDGET_PLANNING}/${id}`, planData),
    approveBudgetPlan: (id, approvalData) => apiClient.put(`${API_ENDPOINTS.BUDGET_PLANNING}/${id}/approve`, approvalData),

    // Budget Allocation
    getBudgetAllocations: (params = {}) => apiClient.get(API_ENDPOINTS.BUDGET_ALLOCATION, { params }),
    allocateBudget: (allocationData) => apiClient.post(API_ENDPOINTS.BUDGET_ALLOCATION, allocationData),
    updateAllocation: (id, allocationData) => apiClient.put(`${API_ENDPOINTS.BUDGET_ALLOCATION}/${id}`, allocationData),
    reallocateBudget: (budgetId, reallocationData) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/reallocate`, reallocationData),

    // Budget Monitoring
    getBudgetMonitoring: (params = {}) => apiClient.get(API_ENDPOINTS.BUDGET_MONITORING, { params }),
    getBudgetUtilization: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/utilization`),
    getBudgetProgress: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/progress`),

    // Budget Variance Analysis
    getBudgetVariance: (params = {}) => apiClient.get(API_ENDPOINTS.BUDGET_VARIANCE, { params }),
    getVarianceReport: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/variance`),
    createVarianceAnalysis: (budgetId, analysisData) => apiClient.post(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/variance-analysis`, analysisData),

    // Budget Expenses
    getBudgetExpenses: (params = {}) => apiClient.get(API_ENDPOINTS.BUDGET_EXPENSES, { params }),
    getBudgetExpenseById: (id) => apiClient.get(API_ENDPOINTS.BUDGET_EXPENSE_BY_ID(id)),
    createBudgetExpense: (expenseData) => apiClient.post(API_ENDPOINTS.BUDGET_EXPENSES, expenseData),
    updateBudgetExpense: (id, expenseData) => apiClient.put(API_ENDPOINTS.BUDGET_EXPENSE_BY_ID(id), expenseData),
    deleteBudgetExpense: (id) => apiClient.delete(API_ENDPOINTS.BUDGET_EXPENSE_BY_ID(id)),
    approveBudgetExpense: (id, approvalData) => apiClient.put(`${API_ENDPOINTS.BUDGET_EXPENSE_BY_ID(id)}/approve`, approvalData),

    // Fiscal Year Management
    getFiscalYears: () => apiClient.get(API_ENDPOINTS.FISCAL_YEARS),
    getCurrentFiscalYear: () => apiClient.get(`${API_ENDPOINTS.FISCAL_YEARS}/current`),
    createFiscalYear: (fiscalYearData) => apiClient.post(API_ENDPOINTS.FISCAL_YEARS, fiscalYearData),
    updateFiscalYear: (id, fiscalYearData) => apiClient.put(`${API_ENDPOINTS.FISCAL_YEARS}/${id}`, fiscalYearData),
    activateFiscalYear: (id) => apiClient.put(`${API_ENDPOINTS.FISCAL_YEARS}/${id}/activate`),
    closeFiscalYear: (id) => apiClient.put(`${API_ENDPOINTS.FISCAL_YEARS}/${id}/close`),

    // Quarters Management
    getQuarters: (fiscalYearId) => apiClient.get(API_ENDPOINTS.QUARTERS, { params: { fiscal_year_id: fiscalYearId } }),
    createQuarter: (quarterData) => apiClient.post(API_ENDPOINTS.QUARTERS, quarterData),
    updateQuarter: (id, quarterData) => apiClient.put(`${API_ENDPOINTS.QUARTERS}/${id}`, quarterData),
    getQuarterlyBudget: (quarterId) => apiClient.get(`${API_ENDPOINTS.QUARTERS}/${quarterId}/budget`),

    // Budget Templates
    getBudgetTemplates: () => apiClient.get(`${API_ENDPOINTS.BUDGETS}/templates`),
    createBudgetTemplate: (templateData) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/templates`, templateData),
    getBudgetTemplateById: (id) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/templates/${id}`),
    useBudgetTemplate: (templateId, budgetData) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/templates/${templateId}/use`, budgetData),

    // Budget Categories & Line Items
    getBudgetCategories: () => apiClient.get(`${API_ENDPOINTS.BUDGETS}/categories`),
    createBudgetCategory: (categoryData) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/categories`, categoryData),
    getBudgetLineItems: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/line-items`),
    createBudgetLineItem: (budgetId, lineItemData) => apiClient.post(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/line-items`, lineItemData),
    updateBudgetLineItem: (budgetId, lineItemId, lineItemData) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/line-items/${lineItemId}`, lineItemData),

    // Budget Approvals & Workflow
    submitBudgetForApproval: (budgetId) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/submit`),
    approveBudget: (budgetId, approvalData) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/approve`, approvalData),
    rejectBudget: (budgetId, rejectionData) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/reject`, rejectionData),
    getApprovalWorkflow: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/workflow`),

    // Budget Revisions
    createBudgetRevision: (budgetId, revisionData) => apiClient.post(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/revisions`, revisionData),
    getBudgetRevisions: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/revisions`),
    approveBudgetRevision: (budgetId, revisionId, approvalData) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/revisions/${revisionId}/approve`, approvalData),

    // Department Budget Management
    getDepartmentBudgets: (departmentId, params = {}) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/department/${departmentId}`, { params }),
    allocateDepartmentBudget: (departmentId, allocationData) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/department/${departmentId}/allocate`, allocationData),
    getDepartmentBudgetSummary: (departmentId, fiscalYearId) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/department/${departmentId}/summary`, {
        params: { fiscal_year_id: fiscalYearId }
    }),

    // Budget Analytics & Reports
    getBudgetAnalytics: (params = {}) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/analytics`, { params }),
    getBudgetSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/summary`, { params }),
    getBudgetComparison: (budgetIds) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/compare`, { budget_ids: budgetIds }),
    getBudgetTrends: (params = {}) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/trends`, { params }),

    // Budget Forecasting
    createBudgetForecast: (budgetId, forecastData) => apiClient.post(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/forecast`, forecastData),
    getBudgetForecast: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/forecast`),
    updateBudgetForecast: (budgetId, forecastData) => apiClient.put(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/forecast`, forecastData),

    // Budget Alerts & Notifications
    getBudgetAlerts: (params = {}) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/alerts`, { params }),
    createBudgetAlert: (alertData) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/alerts`, alertData),
    updateBudgetAlert: (alertId, alertData) => apiClient.put(`${API_ENDPOINTS.BUDGETS}/alerts/${alertId}`, alertData),

    // Export Functions
    exportBudget: (budgetId, format = 'xlsx') => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/export`, {
        params: { format },
        responseType: 'blob'
    }),
    exportBudgetSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.BUDGETS}/summary/export`, {
        params,
        responseType: 'blob'
    }),
    exportVarianceReport: (budgetId) => apiClient.get(`${API_ENDPOINTS.BUDGET_BY_ID(budgetId)}/variance/export`, {
        responseType: 'blob'
    }),
    exportBudgetComparison: (budgetIds) => apiClient.post(`${API_ENDPOINTS.BUDGETS}/compare/export`,
        { budget_ids: budgetIds },
        { responseType: 'blob' }
    ),
};