import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class RolesAPI {
    /**
     * Get all roles
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Roles data
     */
    async getAllRoles(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ROLES, { params }, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Get all roles error:', error);
            throw error;
        }
    }

    /**
     * Get role by ID
     * @param {number} roleId - Role ID
     * @returns {Promise<Object>} - Role data
     */
    async getRoleById(roleId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ROLE_BY_ID(roleId));
            return response.data;
        } catch (error) {
            console.error('Get role by ID error:', error);
            throw error;
        }
    }

    /**
     * Create new role
     * @param {Object} roleData - Role data
     * @returns {Promise<Object>} - Created role
     */
    async createRole(roleData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ROLES, roleData);
            return response.data;
        } catch (error) {
            console.error('Create role error:', error);
            throw error;
        }
    }

    /**
     * Update role
     * @param {number} roleId - Role ID
     * @param {Object} roleData - Updated role data
     * @returns {Promise<Object>} - Updated role
     */
    async updateRole(roleId, roleData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.ROLE_BY_ID(roleId), roleData);
            return response.data;
        } catch (error) {
            console.error('Update role error:', error);
            throw error;
        }
    }

    /**
     * Delete role
     * @param {number} roleId - Role ID
     * @returns {Promise<Object>} - Delete result
     */
    async deleteRole(roleId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.ROLE_BY_ID(roleId));
            return response.data;
        } catch (error) {
            console.error('Delete role error:', error);
            throw error;
        }
    }

    /**
     * Get all permissions
     * @returns {Promise<Object>} - Permissions data
     */
    async getAllPermissions() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PERMISSIONS, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Get all permissions error:', error);
            throw error;
        }
    }

    /**
     * Assign role to user
     * @param {Object} assignmentData - Role assignment data
     * @returns {Promise<Object>} - Assignment result
     */
    async assignRole(assignmentData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ROLE_ASSIGN, assignmentData);
            return response.data;
        } catch (error) {
            console.error('Assign role error:', error);
            throw error;
        }
    }

    /**
     * Remove role from user
     * @param {number} roleId - Role ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - Removal result
     */
    async removeRoleFromUser(roleId, userId) {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.ROLES}/${roleId}/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Remove role from user error:', error);
            throw error;
        }
    }

    /**
     * Get role menu permissions
     * @param {number} roleId - Role ID
     * @returns {Promise<Object>} - Role menu permissions
     */
    async getRoleMenuPermissions(roleId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ROLE_MENU_PERMISSIONS(roleId));
            return response.data;
        } catch (error) {
            console.error('Get role menu permissions error:', error);
            throw error;
        }
    }

    /**
     * Update role menu permissions
     * @param {number} roleId - Role ID
     * @param {Object} permissions - Menu permissions data
     * @returns {Promise<Object>} - Update result
     */
    async updateRoleMenuPermissions(roleId, permissions) {
        try {
            const response = await apiClient.put(
                API_ENDPOINTS.ROLE_MENU_PERMISSIONS(roleId),
                permissions,
                {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Update role menu permissions error:', error);
            throw error;
        }
    }
    
}

const rolesAPI = new RolesAPI();
export default rolesAPI;