import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const departmentsAPI = {
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.DEPARTMENTS, { params }),
    getById: (id) => apiClient.get(API_ENDPOINTS.DEPARTMENT_BY_ID(id)),
    create: (data) => apiClient.post(API_ENDPOINTS.DEPARTMENTS, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.DEPARTMENT_BY_ID(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.DEPARTMENT_BY_ID(id)),
    getEmployees: (id, params = {}) => apiClient.get(API_ENDPOINTS.DEPARTMENT_EMPLOYEES(id), { params }),
};