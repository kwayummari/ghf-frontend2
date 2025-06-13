import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const usersAPI = {
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.USERS, { params }),
    getById: (id) => apiClient.get(API_ENDPOINTS.USER_BY_ID(id)),
    create: (userData) => apiClient.post(API_ENDPOINTS.USERS, userData),
    update: (id, userData) => apiClient.put(API_ENDPOINTS.USER_BY_ID(id), userData),
    delete: (id) => apiClient.delete(API_ENDPOINTS.USER_BY_ID(id)),
    assignRole: (userId, roleId) => apiClient.post('/roles/assign', { user_id: userId, role_id: roleId }),
};