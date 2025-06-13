import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const menusAPI = {
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.MENUS, { params }),
    getUserMenus: () => apiClient.get(API_ENDPOINTS.USER_MENUS),
    getById: (id) => apiClient.get(API_ENDPOINTS.MENU_BY_ID(id)),
    create: (data) => apiClient.post(API_ENDPOINTS.MENUS, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.MENU_BY_ID(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.MENU_BY_ID(id)),
    updateRoleAccess: (roleId, menuId, data) => apiClient.put(API_ENDPOINTS.ROLE_MENU_ACCESS(roleId, menuId), data),
};