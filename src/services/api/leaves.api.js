import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class LeavesAPI {
    /**
     * Get all leave applications
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Leave applications data
     */
    async getAll(params = {}) {
        try {
            // Convert array status to comma-separated string if needed
            if (params.status && Array.isArray(params.status)) {
                params.status = params.status.join(',');
            }

            const response = await apiClient.get(API_ENDPOINTS.LEAVES, { params });

            // Debug logging
            console.log('Leaves API Response:', response);

            return response.data;
        } catch (error) {
            console.error('Get all leaves error:', error);
            // Re-throw with more specific error information
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leaves');
        }
    }

    /**
     * Get leave application by ID
     * @param {number} id - Leave application ID
     * @returns {Promise<Object>} - Leave application data
     */
    async getById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.LEAVE_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Get leave by ID error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leave');
        }
    }

    /**
     * Create new leave application
     * @param {Object} leaveData - Leave application data
     * @returns {Promise<Object>} - Created leave application
     */
    async create(leaveData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LEAVES, leaveData);
            return response.data;
        } catch (error) {
            console.error('Create leave error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to create leave');
        }
    }

    /**
     * Update leave application
     * @param {number} id - Leave application ID
     * @param {Object} leaveData - Updated leave data
     * @returns {Promise<Object>} - Updated leave application
     */
    async update(id, leaveData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.LEAVE_BY_ID(id), leaveData);
            return response.data;
        } catch (error) {
            console.error('Update leave error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to update leave');
        }
    }

    /**
     * Update leave application status (approve/reject)
     * @param {number} id - Leave application ID
     * @param {Object} statusData - Status update data
     * @returns {Promise<Object>} - Update result
     */
    async updateStatus(id, statusData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.LEAVE_STATUS(id), statusData);
            return response.data;
        } catch (error) {
            console.error('Update leave status error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to update leave status');
        }
    }

    /**
     * Cancel leave application
     * @param {number} id - Leave application ID
     * @param {Object} cancelData - Cancellation data
     * @returns {Promise<Object>} - Cancel result
     */
    async cancel(id, cancelData = {}) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.LEAVE_CANCEL(id), cancelData);
            return response.data;
        } catch (error) {
            console.error('Cancel leave error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to cancel leave');
        }
    }

    /**
     * Get available leave types
     * @returns {Promise<Object>} - Leave types data
     */
    async getTypes() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.LEAVE_TYPES);

            // Debug logging
            console.log('Leave Types API Response:', response);

            return response.data;
        } catch (error) {
            console.error('Get leave types error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leave types');
        }
    }

    /**
     * Get user's own leave applications (if you have a separate endpoint)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - User's leave applications
     */
    async getMyLeaves(params = {}) {
        try {
            // Since your backend doesn't have a separate /my endpoint,
            // we'll use the main endpoint and let the backend filter by user
            return this.getAll(params);
        } catch (error) {
            console.error('Get my leaves error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch my leaves');
        }
    }

    /**
     * Get leave applications for approval (managers)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Pending leave applications
     */
    async getForApproval(params = {}) {
        try {
            // Filter for pending statuses
            const approvalParams = {
                ...params,
                status: 'pending,approved by supervisor'
            };

            return this.getAll(approvalParams);
        } catch (error) {
            console.error('Get leaves for approval error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leaves for approval');
        }
    }

    /**
     * Get leave statistics (if available)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Leave statistics
     */
    async getStatistics(params = {}) {
        try {
            // This endpoint might not exist in your backend yet
            const response = await apiClient.get(`${API_ENDPOINTS.LEAVES}/statistics`, { params });
            return response.data;
        } catch (error) {
            console.error('Get leave statistics error:', error);
            // Don't throw error for optional endpoint
            return { success: false, data: null };
        }
    }

    /**
     * Get leave balance for user (if available)
     * @param {number} userId - User ID (optional, defaults to current user)
     * @returns {Promise<Object>} - Leave balance data
     */
    async getBalance(userId = null) {
        try {
            // This endpoint might not exist in your backend yet
            const endpoint = userId
                ? `${API_ENDPOINTS.LEAVES}/balance/${userId}`
                : `${API_ENDPOINTS.LEAVES}/balance`;

            const response = await apiClient.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('Get leave balance error:', error);
            // Don't throw error for optional endpoint
            return { success: false, data: null };
        }
    }

    /**
     * Check leave conflicts (if available)
     * @param {Object} leaveData - Leave data to check
     * @returns {Promise<Object>} - Conflict check result
     */
    async checkConflicts(leaveData) {
        try {
            // This endpoint might not exist in your backend yet
            const response = await apiClient.post(`${API_ENDPOINTS.LEAVES}/check-conflicts`, leaveData);
            return response.data;
        } catch (error) {
            console.error('Check leave conflicts error:', error);
            // Don't throw error for optional endpoint
            return { success: false, data: null };
        }
    }
}

// Create and export a singleton instance
const leavesAPI = new LeavesAPI();
export { leavesAPI };

// Also export the class for potential custom instances
export default LeavesAPI;