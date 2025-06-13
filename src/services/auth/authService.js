import apiClient, { getCurrentUser, clearAuthData } from '../api/axios.config';
import { API_ENDPOINTS, AUTH_CONSTANTS } from '../../constants';

class AuthService {
    /**
     * Login user with email and password
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise<Object>} - User data and tokens
     */
    async login(credentials) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
            const { data } = response.data;

            // Store tokens and user data
            if (data.access_token) {
                localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, data.access_token);
            }

            if (data.refresh_token) {
                localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, data.refresh_token);
            }

            if (data.user) {
                localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - User data
     */
    async register(userData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            // Clear local storage
            clearAuthData();

            // Optional: Call logout endpoint if exists
            // await apiClient.post('/auth/logout');

            // Redirect to login page
            window.location.href = AUTH_CONSTANTS.LOGOUT_REDIRECT;
        } catch (error) {
            console.error('Logout error:', error);
            // Clear data anyway
            clearAuthData();
            window.location.href = AUTH_CONSTANTS.LOGOUT_REDIRECT;
        }
    }

    /**
     * Get current user profile
     * @returns {Promise<Object>} - User profile data
     */
    async getProfile() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PROFILE);
            const userData = response.data.data;

            // Update stored user data
            localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    /**
     * Change user password
     * @param {Object} passwordData - Password change data
     * @param {string} passwordData.currentPassword - Current password
     * @param {string} passwordData.newPassword - New password
     * @param {string} passwordData.confirmPassword - Confirm new password
     * @returns {Promise<Object>} - Response data
     */
    async changePassword(passwordData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                confirm_password: passwordData.confirmPassword,
            });

            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} - Response data
     */
    async forgotPassword(email) {
        try {
            const response = await apiClient.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {Object} resetData - Password reset data
     * @param {string} resetData.token - Reset token
     * @param {string} resetData.password - New password
     * @param {string} resetData.confirmPassword - Confirm new password
     * @returns {Promise<Object>} - Response data
     */
    async resetPassword(resetData) {
        try {
            const response = await apiClient.post('/auth/reset-password', {
                token: resetData.token,
                password: resetData.password,
                confirm_password: resetData.confirmPassword,
            });

            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Refresh access token
     * @returns {Promise<Object>} - New tokens
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await apiClient.post(API_ENDPOINTS.REFRESH_TOKEN, {
                refresh_token: refreshToken,
            });

            const { data } = response.data;

            // Update tokens
            if (data.access_token) {
                localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, data.access_token);
            }

            if (data.refresh_token) {
                localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, data.refresh_token);
            }

            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            // Clear invalid tokens
            clearAuthData();
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
        const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
        const user = getCurrentUser();
        return !!(token && user);
    }

    /**
     * Get current user data
     * @returns {Object|null} - Current user data
     */
    getCurrentUser() {
        return getCurrentUser();
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} - Whether user has the role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;

        return user.roles.some(userRole =>
            typeof userRole === 'string'
                ? userRole === role
                : userRole.role_name === role
        );
    }

    /**
     * Check if user has any of the specified roles
     * @param {string[]} roles - Roles to check
     * @returns {boolean} - Whether user has any of the roles
     */
    hasAnyRole(roles) {
        return roles.some(role => this.hasRole(role));
    }

    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean} - Whether user has the permission
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user || !user.permissions) return false;

        return user.permissions.some(userPermission =>
            typeof userPermission === 'string'
                ? userPermission === permission
                : userPermission.name === permission
        );
    }

    /**
     * Check if user has any of the specified permissions
     * @param {string[]} permissions - Permissions to check
     * @returns {boolean} - Whether user has any of the permissions
     */
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Get user's accessible menu items
     * @returns {Promise<Array>} - User's menu items
     */
    async getUserMenus() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER_MENUS);
            return response.data.data || [];
        } catch (error) {
            console.error('Get user menus error:', error);
            return [];
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} - Updated user data
     */
    async updateProfile(profileData) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.put(API_ENDPOINTS.USER_BY_ID(user.id), profileData);
            const updatedUser = response.data.data;

            // Update stored user data
            localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(updatedUser));

            return updatedUser;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;