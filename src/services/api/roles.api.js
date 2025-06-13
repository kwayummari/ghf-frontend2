import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const rolesAPI = {
    getAll: () => apiClient.get(API_ENDPOINTS.ROLES),
    getById: (id) => apiClient.get(API_ENDPOINTS.ROLE_BY_ID(id)),
    create: (data) => apiClient.post(API_ENDPOINTS.ROLES, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.ROLE_BY_ID(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.ROLE_BY_ID(id)),
    getPermissions: () => apiClient.get(API_ENDPOINTS.PERMISSIONS),
    assignRole: (data) => apiClient.post(API_ENDPOINTS.ROLE_ASSIGN, data),
    removeUserRole: (roleId, userId) => apiClient.delete(`${API_ENDPOINTS.ROLES}/${roleId}/users/${userId}`),
    getMenuPermissions: (id) => apiClient.get(API_ENDPOINTS.ROLE_MENU_PERMISSIONS(id)),
    updateMenuPermissions: (id, data) => apiClient.put(API_ENDPOINTS.ROLE_MENU_PERMISSIONS(id), data),
};