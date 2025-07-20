// src/services/api/leaves.api.js - Enhanced with delete method

import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

/**
 * Leaves API Service
 * Handles all leave-related API calls
 */
class LeavesAPI {
    /**
     * Get all leave applications
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Leave applications data
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.LEAVES, { params });
            return response.data;
        } catch (error) {
            console.error('Get leaves error:', error);
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
     * Create leave application
     * @param {Object} leaveData - Leave application data
     * @returns {Promise<Object>} - Created leave application
     */
    async create(leaveData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LEAVES, leaveData);
            return response.data;
        } catch (error) {
            console.error('Create leave error:', error);

            // Handle validation errors specifically
            if (error.response?.status === 400) {
                const validationErrors = error.response.data?.validation_errors || [];
                if (validationErrors.length > 0) {
                    const errorMessage = validationErrors.map(err => err.message).join(', ');
                    throw new Error(errorMessage);
                }
            }

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

            // Handle validation errors specifically
            if (error.response?.status === 400) {
                const validationErrors = error.response.data?.validation_errors || [];
                if (validationErrors.length > 0) {
                    const errorMessage = validationErrors.map(err => err.message).join(', ');
                    throw new Error(errorMessage);
                }
            }

            throw new Error(error.response?.data?.message || error.message || 'Failed to update leave');
        }
    }

    /**
     * Delete leave application (only for drafts)
     * @param {number} id - Leave application ID
     * @returns {Promise<Object>} - Delete result
     */
    async delete(id) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.LEAVE_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Delete leave error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete leave');
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
            return response.data;
        } catch (error) {
            console.error('Get leave types error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leave types');
        }
    }

    /**
     * Get user's own leave applications
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - User's leave applications
     */
    async getMyLeaves(params = {}) {
        try {
            // Filter by current user on frontend since backend handles this
            return this.getAll(params);
        } catch (error) {
            console.error('Get my leaves error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch my leaves');
        }
    }


    /**
     * Get leave statistics (if available)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Leave statistics
     */
    async getStatistics(params = {}) {
        try {
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
            const endpoint = userId
                ? API_ENDPOINTS.LEAVE_BALANCE_BY_USER(userId)
                : API_ENDPOINTS.LEAVE_BALANCE;

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
            const response = await apiClient.post(API_ENDPOINTS.LEAVE_CHECK_CONFLICTS, leaveData);
            return response.data;
        } catch (error) {
            console.error('Check leave conflicts error:', error);
            // Don't throw error for optional endpoint
            return { success: false, data: null };
        }
    }

    /**
     * Bulk action on multiple leave applications
     * @param {Object} actionData - Bulk action data
     * @returns {Promise<Object>} - Bulk action result
     */
    async bulkAction(actionData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LEAVE_BULK_ACTION, actionData);
            return response.data;
        } catch (error) {
            console.error('Bulk action error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to perform bulk action');
        }
    }

    /**
     * Export leave applications
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} - Export file blob
     */
    async export(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.LEAVE_EXPORT, {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Export leaves error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to export leaves');
        }
    }

    // Add these methods to your existing leaves.api.js class

    /**
     * Get leave balance for user
     * @param {number} userId - User ID (optional, defaults to current user)
     * @param {number} year - Year for balance calculation
     * @returns {Promise<Object>} - Leave balance data
     */
    async getBalance(userId = null, year = null) {
        try {
            const params = {};
            if (year) params.year = year;

            const endpoint = userId
                ? API_ENDPOINTS.LEAVE_BALANCE_BY_USER(userId)
                : API_ENDPOINTS.LEAVE_BALANCE;

            const response = await apiClient.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error('Get leave balance error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leave balance');
        }
    }

    /**
     * Check if leave application is within balance limits
     * @param {Object} leaveData - Leave data to check
     * @returns {Promise<Object>} - Balance check result
     */
    async checkBalance(leaveData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LEAVE_CHECK_BALANCE, leaveData);
            return response.data;
        } catch (error) {
            console.error('Check leave balance error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to check leave balance');
        }
    }

    // Update your existing checkConflicts method to use the new endpoint:
    /**
     * Check leave conflicts (updated to use check-balance endpoint)
     * @param {Object} leaveData - Leave data to check
     * @returns {Promise<Object>} - Conflict check result
     */
    async checkConflicts(leaveData) {
        try {
            // Use the balance check which also validates conflicts
            return await this.checkBalance(leaveData);
        } catch (error) {
            console.error('Check leave conflicts error:', error);
            return { success: false, data: null, message: error.message };
        }
    }


    /**
     * Get leave applications for approval (manager queue)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Leave applications for approval
     */
    async getForApproval(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.LEAVE_APPROVALS, { params });
            return response.data;
        } catch (error) {
            console.error('Get leaves for approval error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leaves for approval');
        }
    }

    /**
 * Resubmit leave application
 * @param {number} id - Leave application ID
 * @param {Object} resubmitData - Resubmit data
 * @returns {Promise<Object>} - Resubmit result
 */
    async resubmit(id, resubmitData = {}) {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.LEAVES}/${id}/resubmit`, resubmitData);
            return response.data;
        } catch (error) {
            console.error('Resubmit leave error:', error);

            // Handle validation errors specifically
            if (error.response?.status === 400) {
                const validationErrors = error.response.data?.validation_errors || [];
                if (validationErrors.length > 0) {
                    const errorMessage = validationErrors.map(err => err.message).join(', ');
                    throw new Error(errorMessage);
                }
            }

            throw new Error(error.response?.data?.message || error.message || 'Failed to resubmit leave');
        }
    }
    

    /**
 * Create leave type
 * @param {Object} leaveTypeData - Leave type data
 * @returns {Promise<Object>} - Created leave type
 */
    async createLeaveType(leaveTypeData) {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.LEAVE_TYPES}`, leaveTypeData);
            return response.data;
        } catch (error) {
            console.error('Create leave type error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to create leave type');
        }
    }

    /**
     * Update leave type
     * @param {number} id - Leave type ID
     * @param {Object} leaveTypeData - Updated leave type data
     * @returns {Promise<Object>} - Updated leave type
     */
    async updateLeaveType(id, leaveTypeData) {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.LEAVE_TYPES}/${id}`, leaveTypeData);
            return response.data;
        } catch (error) {
            console.error('Update leave type error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to update leave type');
        }
    }

    /**
     * Delete leave type
     * @param {number} id - Leave type ID
     * @returns {Promise<Object>} - Delete result
     */
    async deleteLeaveType(id) {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.LEAVE_TYPES}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete leave type error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete leave type');
        }
    }
}

// Create and export a singleton instance
const leavesAPI = new LeavesAPI();
export { leavesAPI };

// Also export the class for potential custom instances
export default LeavesAPI;