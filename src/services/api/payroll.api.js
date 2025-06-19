import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const payrollAPI = {
    // Get all payroll records with optional filters
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.PAYROLL, { params }),

    // Get payroll record by ID
    getById: (id) => apiClient.get(API_ENDPOINTS.PAYROLL_BY_ID(id)),

    // Get payroll records for specific employee
    getByEmployee: (userId) => apiClient.get(API_ENDPOINTS.PAYROLL_EMPLOYEE(userId)),

    // Get payroll records for specific period
    getByPeriod: (year, month) => apiClient.get(API_ENDPOINTS.PAYROLL_PERIOD(year, month)),

    // Create new payroll record
    create: (payrollData) => apiClient.post(API_ENDPOINTS.PAYROLL, payrollData),

    // Update payroll record
    update: (id, payrollData) => apiClient.put(API_ENDPOINTS.PAYROLL_BY_ID(id), payrollData),

    // Delete payroll record
    delete: (id) => apiClient.delete(API_ENDPOINTS.PAYROLL_BY_ID(id)),

    // Process payroll for a period
    processPayroll: (processData) => apiClient.post(API_ENDPOINTS.PAYROLL_PROCESS, processData),

    // Approve payroll record
    approve: (id, approvalData) => apiClient.put(API_ENDPOINTS.PAYROLL_APPROVE(id), approvalData),

    // Get salary components
    getSalaryComponents: (params = {}) => apiClient.get(API_ENDPOINTS.SALARY_COMPONENTS, { params }),

    // Get salary components for specific user
    getSalaryComponentsByUser: (userId) => apiClient.get(API_ENDPOINTS.SALARY_COMPONENT_BY_USER(userId)),

    // Update salary components for user
    updateSalaryComponents: (userId, componentsData) =>
        apiClient.put(API_ENDPOINTS.SALARY_COMPONENT_BY_USER(userId), componentsData),

    // Get payroll reports
    getReports: (params = {}) => apiClient.get(API_ENDPOINTS.PAYROLL_REPORTS, { params }),

    // Get payslips
    getPayslips: (params = {}) => apiClient.get(API_ENDPOINTS.PAYSLIPS, { params }),

    // Get specific payslip
    getPayslipById: (id) => apiClient.get(API_ENDPOINTS.PAYSLIP_BY_ID(id)),

    // Generate payslip PDF
    generatePayslipPDF: (id) => apiClient.get(`${API_ENDPOINTS.PAYSLIP_BY_ID(id)}/pdf`, {
        responseType: 'blob'
    }),

    // Export payroll data
    exportPayrollData: (params = {}) => apiClient.get(`${API_ENDPOINTS.PAYROLL}/export`, {
        params,
        responseType: 'blob'
    }),

    // Get payroll summary/statistics
    getPayrollSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.PAYROLL}/summary`, { params }),

    // Bulk approve payroll records
    bulkApprove: (payrollIds) => apiClient.post(`${API_ENDPOINTS.PAYROLL}/bulk-approve`, { payrollIds }),

    // Reprocess payroll record
    reprocess: (id) => apiClient.post(`${API_ENDPOINTS.PAYROLL_BY_ID(id)}/reprocess`),

    // Get payroll calculations preview
    getCalculationPreview: (employeeId, period) =>
        apiClient.get(`${API_ENDPOINTS.PAYROLL}/preview`, {
            params: { employeeId, period }
        }),
};