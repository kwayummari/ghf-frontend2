// src/services/api/activityLogs.api.js
import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class ActivityLogsAPI {
    /**
     * Get activity logs with filtering and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Activity logs data
     */
    async getActivityLogs(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.SYSTEM_LOGS, { params });
            return response.data;
        } catch (error) {
            console.error('Get activity logs error:', error);
            throw error;
        }
    }

    /**
     * Get activity statistics
     * @returns {Promise<Object>} - Activity statistics
     */
    async getActivityStats() {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM_LOGS}/stats`);
            return response.data;
        } catch (error) {
            console.error('Get activity stats error:', error);
            throw error;
        }
    }

    /**
     * Get recent activities for dashboard
     * @param {number} limit - Number of activities to fetch
     * @returns {Promise<Object>} - Recent activities
     */
    async getRecentActivities(limit = 10) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM_LOGS}/recent`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Get recent activities error:', error);
            throw error;
        }
    }

    /**
     * Export activity logs
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} - Export file blob
     */
    async exportActivityLogs(params = {}) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM_LOGS}/export`, {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Export activity logs error:', error);
            throw error;
        }
    }

    /**
     * Get activity log by ID
     * @param {number} logId - Log ID
     * @returns {Promise<Object>} - Activity log details
     */
    async getActivityLogById(logId) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM_LOGS}/${logId}`);
            return response.data;
        } catch (error) {
            console.error('Get activity log by ID error:', error);
            throw error;
        }
    }

    /**
     * Create activity log (for manual logging)
     * @param {Object} logData - Log data
     * @returns {Promise<Object>} - Created log
     */
    async createActivityLog(logData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.SYSTEM_LOGS, logData);
            return response.data;
        } catch (error) {
            console.error('Create activity log error:', error);
            throw error;
        }
    }

    /**
     * Get audit trail for specific entity
     * @param {string} entityType - Entity type (user, employee, etc.)
     * @param {number} entityId - Entity ID
     * @returns {Promise<Object>} - Audit trail
     */
    async getAuditTrail(entityType, entityId) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM_LOGS}/audit-trail`, {
                params: { entity_type: entityType, entity_id: entityId }
            });
            return response.data;
        } catch (error) {
            console.error('Get audit trail error:', error);
            throw error;
        }
    }

    /**
     * Get system backup logs
     * @returns {Promise<Object>} - Backup logs
     */
    async getBackupLogs() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.SYSTEM_BACKUP);
            return response.data;
        } catch (error) {
            console.error('Get backup logs error:', error);
            throw error;
        }
    }

    /**
     * Create system backup
     * @param {Object} backupData - Backup configuration
     * @returns {Promise<Object>} - Backup result
     */
    async createBackup(backupData = {}) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.SYSTEM_BACKUP, backupData);
            return response.data;
        } catch (error) {
            console.error('Create backup error:', error);
            throw error;
        }
    }

    /**
     * Get security events
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Security events
     */
    async getSecurityEvents(params = {}) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM_LOGS}/security`, { params });
            return response.data;
        } catch (error) {
            console.error('Get security events error:', error);
            throw error;
        }
    }

    /**
     * Log user action (middleware function)
     * @param {string} action - Action performed
     * @param {string} module - Module/feature
     * @param {string} description - Action description
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} - Log result
     */
    async logUserAction(action, module, description, metadata = {}) {
        try {
            const logData = {
                action,
                module,
                description,
                metadata,
                timestamp: new Date().toISOString()
            };

            const response = await apiClient.post(`${API_ENDPOINTS.SYSTEM_LOGS}/user-action`, logData);
            return response.data;
        } catch (error) {
            // Don't throw error for logging failures to avoid breaking main operations
            console.error('Log user action error:', error);
            return null;
        }
    }
}

const activityLogsAPI = new ActivityLogsAPI();
export default activityLogsAPI;