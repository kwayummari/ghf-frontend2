import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const leavesAPI = {
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.LEAVES, { params }),
    getById: (id) => apiClient.get(API_ENDPOINTS.LEAVE_BY_ID(id)),
    create: (leaveData) => apiClient.post(API_ENDPOINTS.LEAVES, leaveData),
    update: (id, leaveData) => apiClient.put(API_ENDPOINTS.LEAVE_BY_ID(id), leaveData),
    updateStatus: (id, statusData) => apiClient.put(API_ENDPOINTS.LEAVE_STATUS(id), statusData),
    cancel: (id) => apiClient.put(`${API_ENDPOINTS.LEAVE_BY_ID(id)}/cancel`),
    delete: (id) => apiClient.delete(API_ENDPOINTS.LEAVE_BY_ID(id)),
    getTypes: () => apiClient.get(API_ENDPOINTS.LEAVE_TYPES),
    getMyLeaves: (params = {}) => apiClient.get(`${API_ENDPOINTS.LEAVES}/my`, { params }),
};