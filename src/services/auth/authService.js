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

            // Store tokens and user data - FIXED: Check for both token and access_token
            const accessToken = data.token || data.access_token;
            const refreshToken = data.refreshToken || data.refresh_token;

            if (accessToken) {
                localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, accessToken);
                // Update axios default header immediately
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            if (refreshToken) {
                localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, refreshToken);
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
            // Clear axios header
            delete apiClient.defaults.headers.common['Authorization'];

            // Clear local storage
            clearAuthData();

            // Optional: Call logout endpoint if exists
            // await apiClient.post('/auth/logout');

            // Redirect to login page
            window.location.href = AUTH_CONSTANTS.LOGOUT_REDIRECT;
        } catch (error) {
            console.error('Logout error:', error);
            // Clear data anyway
            delete apiClient.defaults.headers.common['Authorization'];
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
     * @returns {Promise<Object>} - Response data
     */
    async changePassword(passwordData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
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
                refreshToken: refreshToken,
            });

            const { data } = response.data;

            // Update tokens - FIXED: Check for both token formats
            const accessToken = data.token || data.access_token;
            const newRefreshToken = data.refreshToken || data.refresh_token;

            if (accessToken) {
                localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, accessToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            if (newRefreshToken) {
                localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, newRefreshToken);
            }

            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            // Clear invalid tokens
            delete apiClient.defaults.headers.common['Authorization'];
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
     * Initialize authentication state (call on app startup)
     */
    initializeAuth() {
        const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
        if (token) {
            // Set the authorization header for existing token
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
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
            // FIXED: Ensure user is authenticated and token is set
            if (!this.isAuthenticated()) {
                console.warn('User is not authenticated, cannot fetch menus');
                return [];
            }

            // Make sure the token is in the headers
            const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
            if (token && !apiClient.defaults.headers.common['Authorization']) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            console.log('Fetching user menus...');
            const response = await apiClient.get(API_ENDPOINTS.USER_MENUS);

            console.log('Menu response:', response.data);
            return response.data.data || [];
        } catch (error) {
            console.error('Get user menus error:', error);

            // If it's an auth error, clear tokens and redirect
            if (error.response?.status === 401) {
                console.log('Authentication failed while fetching menus, clearing auth data');
                this.logout();
                return [];
            }

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