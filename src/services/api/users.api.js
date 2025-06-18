import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class UsersAPI {
    /**
     * Get all users
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Users data
     */
    async getAllUsers(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USERS, { params });
            return response.data;
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - User data
     */
    async getUserById(userId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(userId));
            return response.data;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw error;
        }
    }

    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - Created user
     */
    async createUser(userData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.USERS, userData);
            return response.data;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    /**
     * Update user
     * @param {number} userId - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} - Updated user
     */
    async updateUser(userId, userData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.USER_BY_ID(userId), userData);
            return response.data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    /**
     * Delete user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - Delete result
     */
    async deleteUser(userId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.USER_BY_ID(userId));
            return response.data;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    /**
     * Assign roles to user
     * @param {number} userId - User ID
     * @param {Array} roleIds - Array of role IDs
     * @returns {Promise<Object>} - Assignment result
     */
    async assignRolesToUser(userId, roleIds) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ROLE_ASSIGN, {
                user_id: userId,
                role_ids: roleIds,
            });
            return response.data;
        } catch (error) {
            console.error('Assign roles to user error:', error);
            throw error;
        }
    }

    /**
     * Get user roles
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - User roles
     */
    async getUserRoles(userId) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.USERS}/${userId}/roles`);
            return response.data;
        } catch (error) {
            console.error('Get user roles error:', error);
            throw error;
        }
    }

    /**
     * Reset user password
     * @param {number} userId - User ID
     * @param {Object} passwordData - Password data
     * @returns {Promise<Object>} - Reset result
     */
    async resetUserPassword(userId, passwordData) {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.USERS}/${userId}/reset-password`, passwordData);
            return response.data;
        } catch (error) {
            console.error('Reset user password error:', error);
            throw error;
        }
    }

    /**
     * Toggle user status (activate/deactivate)
     * @param {number} userId - User ID
     * @param {boolean} isActive - Active status
     * @returns {Promise<Object>} - Update result
     */
    async toggleUserStatus(userId, isActive) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.USER_BY_ID(userId), {
                is_active: isActive,
            });
            return response.data;
        } catch (error) {
            console.error('Toggle user status error:', error);
            throw error;
        }
    }
}

const usersAPI = new UsersAPI();
export default usersAPI;