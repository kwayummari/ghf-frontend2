import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const employeesAPI = {
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.EMPLOYEES, { params }),
    getById: (id) => apiClient.get(API_ENDPOINTS.EMPLOYEE_BY_ID(id)),
    create: (employeeData) => apiClient.post(API_ENDPOINTS.EMPLOYEES, employeeData),
    update: (id, employeeData) => apiClient.put(API_ENDPOINTS.EMPLOYEE_BY_ID(id), employeeData),
    delete: (id) => apiClient.delete(API_ENDPOINTS.EMPLOYEE_BY_ID(id)),
    uploadDocument: (id, formData) => apiClient.post(`${API_ENDPOINTS.EMPLOYEE_BY_ID(id)}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};