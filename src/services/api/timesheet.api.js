import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class TimesheetAPI {
    /**
     * Get timesheet for specific month/year
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Timesheet data
     */
    async getTimesheet(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TIMESHEETS, { params });
            return response.data;
        } catch (error) {
            console.error('Get timesheet error:', error);
            throw error;
        }
    }

    /**
     * Get timesheet by ID
     * @param {number} id - Timesheet ID
     * @returns {Promise<Object>} - Timesheet data
     */
    async getTimesheetById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TIMESHEET_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Get timesheet by ID error:', error);
            throw error;
        }
    }

    /**
     * Create new timesheet
     * @param {Object} timesheetData - Timesheet data
     * @returns {Promise<Object>} - Created timesheet
     */
    async createTimesheet(timesheetData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.TIMESHEETS, timesheetData);
            return response.data;
        } catch (error) {
            console.error('Create timesheet error:', error);
            throw error;
        }
    }

    /**
     * Update timesheet
     * @param {number} id - Timesheet ID
     * @param {Object} timesheetData - Updated timesheet data
     * @returns {Promise<Object>} - Updated timesheet
     */
    async updateTimesheet(id, timesheetData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.TIMESHEET_BY_ID(id), timesheetData);
            return response.data;
        } catch (error) {
            console.error('Update timesheet error:', error);
            throw error;
        }
    }

    /**
     * Submit timesheet for approval
     * @param {number} id - Timesheet ID
     * @returns {Promise<Object>} - Submission result
     */
    async submitTimesheet(id) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.TIMESHEET_SUBMIT(id));
            return response.data;
        } catch (error) {
            console.error('Submit timesheet error:', error);
            throw error;
        }
    }

    /**
     * Approve timesheet (supervisor action)
     * @param {number} id - Timesheet ID
     * @param {Object} approvalData - Approval data
     * @returns {Promise<Object>} - Approval result
     */
    async approveTimesheet(id, approvalData = {}) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.TIMESHEET_APPROVE(id), approvalData);
            return response.data;
        } catch (error) {
            console.error('Approve timesheet error:', error);
            throw error;
        }
    }

    /**
     * Reject timesheet (supervisor action)
     * @param {number} id - Timesheet ID
     * @param {Object} rejectionData - Rejection data with reason
     * @returns {Promise<Object>} - Rejection result
     */
    async rejectTimesheet(id, rejectionData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.TIMESHEET_REJECT(id), rejectionData);
            return response.data;
        } catch (error) {
            console.error('Reject timesheet error:', error);
            throw error;
        }
    }

    /**
     * Delete timesheet
     * @param {number} id - Timesheet ID
     * @returns {Promise<Object>} - Deletion result
     */
    async deleteTimesheet(id) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.TIMESHEET_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Delete timesheet error:', error);
            throw error;
        }
    }

    /**
     * Get timesheets for a team/department (supervisor view)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Team timesheets
     */
    async getTeamTimesheets(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TEAM_TIMESHEETS, { params });
            return response.data;
        } catch (error) {
            console.error('Get team timesheets error:', error);
            throw error;
        }
    }

    /**
     * Get timesheet summary/statistics
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Timesheet statistics
     */
    async getTimesheetSummary(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TIMESHEET_SUMMARY, { params });
            return response.data;
        } catch (error) {
            console.error('Get timesheet summary error:', error);
            throw error;
        }
    }

    /**
     * Export timesheet data
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} - File blob
     */
    async exportTimesheet(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TIMESHEET_EXPORT, {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Export timesheet error:', error);
            throw error;
        }
    }
}

const timesheetAPI = new TimesheetAPI();
export default timesheetAPI;