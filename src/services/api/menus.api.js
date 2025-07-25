import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class MenusAPI {
    /**
     * Get all menus
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Menus data
     */
    async getAllMenus(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MENUS, { params });
            return response.data;
        } catch (error) {
            console.error('Get all menus error:', error);
            throw error;
        }
    }

    /**
     * Get user menus (dynamic navigation)
     * @returns {Promise<Object>} - User menus data
     */
    async getUserMenus() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER_MENUS);
            return response.data;
        } catch (error) {
            console.error('Get user menus error:', error);
            throw error;
        }
    }

    /**
     * Get menu by ID
     * @param {number} menuId - Menu ID
     * @returns {Promise<Object>} - Menu data
     */
    async getMenuById(menuId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MENU_BY_ID(menuId));
            return response.data;
        } catch (error) {
            console.error('Get menu by ID error:', error);
            throw error;
        }
    }

    /**
     * Create new menu
     * @param {Object} menuData - Menu data
     * @returns {Promise<Object>} - Created menu
     */
    async createMenu(menuData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.MENUS, menuData);
            return response.data;
        } catch (error) {
            console.error('Create menu error:', error);
            throw error;
        }
    }

    /**
     * Update menu
     * @param {number} menuId - Menu ID
     * @param {Object} menuData - Updated menu data
     * @returns {Promise<Object>} - Updated menu
     */
    async updateMenu(menuId, menuData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.MENU_BY_ID(menuId), menuData);
            return response.data;
        } catch (error) {
            console.error('Update menu error:', error);
            throw error;
        }
    }

    /**
     * Delete menu
     * @param {number} menuId - Menu ID
     * @returns {Promise<Object>} - Delete result
     */
    async deleteMenu(menuId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.MENU_BY_ID(menuId));
            return response.data;
        } catch (error) {
            console.error('Delete menu error:', error);
            throw error;
        }
    }

    /**
     * Update role menu access
     * @param {number} roleId - Role ID
     * @param {number} menuId - Menu ID
     * @param {Object} accessData - Access data
     * @returns {Promise<Object>} - Update result
     */
    async updateRoleMenuAccess(roleId, menuId, accessData) {
        try {
            const response = await apiClient.put(
                API_ENDPOINTS.ROLE_MENU_ACCESS(roleId, menuId),
                accessData
            );
            return response.data;
        } catch (error) {
            console.error('Update role menu access error:', error);
            throw error;
        }
    }

    /**
     * Get permission matrix
     * @returns {Promise<Object>} - Permission matrix data
     */
    async getMenuPermissionMatrix() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MENU_PERMISSION_MATRIX, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
            return response.data;
        } catch (error) {
            console.error('Get permission matrix error:', error);
            throw error;
        }
    }

    /**
     * Update menu order
     * @param {number} menuId - Menu ID
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} - Update result
     */
    async updateMenuOrder(menuId, orderData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.MENU_ORDER_UPDATE(menuId), orderData);
            return response.data;
        } catch (error) {
            console.error('Update menu order error:', error);
            throw error;
        }
    }

    /**
     * Bulk update role-menu permissions
     * @param {Object} permissionData - Permission data
     * @returns {Promise<Object>} - Update result
     */
    async bulkUpdateRoleMenuPermissions(permissionData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.MENU_BULK_PERMISSIONS, permissionData);
            return response.data;
        } catch (error) {
            console.error('Bulk update permissions error:', error);
            throw error;
        }
    }

    /**
     * Get role permissions for a specific menu
     * @param {number} menuId - Menu ID
     * @returns {Promise<Object>} - Role permissions data
     */
    async getRoleMenuPermissions(menuId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MENU_ROLE_PERMISSIONS(menuId));
            return response.data;
        } catch (error) {
            console.error('Get role menu permissions error:', error);
            throw error;
        }
    }

    /**
     * Update role permissions for a specific menu
     * @param {number} menuId - Menu ID
     * @param {Object} rolePermissions - Role permissions data
     * @returns {Promise<Object>} - Update result
     */
    async updateRoleMenuPermissions(menuId, rolePermissions) {
        try {
            const response = await apiClient.put(
                API_ENDPOINTS.MENU_ROLE_PERMISSIONS(menuId),
                rolePermissions
            );
            return response.data;
        } catch (error) {
            console.error('Update role menu permissions error:', error);
            throw error;
        }
    }
}

const menusAPI = new MenusAPI();
export default menusAPI;