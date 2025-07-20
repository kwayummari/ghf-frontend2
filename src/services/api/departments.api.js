import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class DepartmentAPI {
    /**
     * Get all departments with pagination and search
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Departments list with pagination
     */
    async getAllDepartments(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DEPARTMENTS, { params });
            return response.data;
        } catch (error) {
            console.error('Get departments error:', error);
            throw error;
        }
    }

    /**
     * Get department by ID
     * @param {number} id - Department ID
     * @returns {Promise<Object>} - Department details
     */
    async getDepartmentById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DEPARTMENT_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Get department by ID error:', error);
            throw error;
        }
    }

    /**
     * Create new department
     * @param {Object} departmentData - Department data
     * @returns {Promise<Object>} - Created department
     */
    async createDepartment(departmentData) {
        try {
            // Validate required fields
            if (!departmentData.department_name) {
                throw new Error('Department name is required');
            }

            const response = await apiClient.post(API_ENDPOINTS.DEPARTMENTS, {
                department_name: departmentData.department_name,
                description: departmentData.description || null,
                head_id: departmentData.head_id || null,
                budget: departmentData.budget ? parseFloat(departmentData.budget) : null,
                location: departmentData.location || null,
                is_active: departmentData.is_active !== undefined ? departmentData.is_active : true,
            });
            return response.data;
        } catch (error) {
            console.error('Create department error:', error);
            throw error;
        }
    }

    /**
     * Update department
     * @param {number} id - Department ID
     * @param {Object} departmentData - Updated department data
     * @returns {Promise<Object>} - Updated department
     */
    async updateDepartment(id, departmentData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.DEPARTMENT_BY_ID(id), {
                department_name: departmentData.department_name,
                description: departmentData.description || null,
                head_id: departmentData.head_id || null,
                budget: departmentData.budget ? parseFloat(departmentData.budget) : null,
                location: departmentData.location || null,
                is_active: departmentData.is_active,
            });
            return response.data;
        } catch (error) {
            console.error('Update department error:', error);
            throw error;
        }
    }

    /**
     * Delete department
     * @param {number} id - Department ID
     * @returns {Promise<Object>} - Delete response
     */
    async deleteDepartment(id) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.DEPARTMENT_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Delete department error:', error);
            throw error;
        }
    }

    /**
     * Get potential department heads
     * @returns {Promise<Object>} - List of users who can be department heads
     */
    async getPotentialHeads() {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.DEPARTMENTS}/potential-heads`);
            return response.data;
        } catch (error) {
            console.error('Get potential heads error:', error);
            throw error;
        }
    }

    /**
     * Get department employees
     * @param {number} id - Department ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Department employees
     */
    async getDepartmentEmployees(id, params = {}) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.DEPARTMENT_BY_ID(id)}/employees`, { params });
            return response.data;
        } catch (error) {
            console.error('Get department employees error:', error);
            throw error;
        }
    }

    /**
     * Assign department head
     * @param {number} departmentId - Department ID
     * @param {number} userId - User ID to assign as head
     * @returns {Promise<Object>} - Assignment response
     */
    async assignDepartmentHead(departmentId, userId) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.DEPARTMENT_BY_ID(departmentId), {
                head_id: userId,
            });
            return response.data;
        } catch (error) {
            console.error('Assign department head error:', error);
            throw error;
        }
    }

    /**
     * Get department statistics
     * @param {number} id - Department ID
     * @returns {Promise<Object>} - Department statistics
     */
    async getDepartmentStats(id) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.DEPARTMENT_BY_ID(id)}/stats`);
            return response.data;
        } catch (error) {
            console.error('Get department stats error:', error);
            throw error;
        }
    }

    /**
     * Toggle department status
     * @param {number} id - Department ID
     * @param {boolean} isActive - New status
     * @returns {Promise<Object>} - Updated department
     */
    async toggleDepartmentStatus(id, isActive) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.DEPARTMENT_BY_ID(id), {
                is_active: isActive,
            });
            return response.data;
        } catch (error) {
            console.error('Toggle department status error:', error);
            throw error;
        }
    }

    /**
     * Export departments data
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} - Excel file blob
     */
    async exportDepartments(params = {}) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.DEPARTMENTS}/export`, {
                params,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Export departments error:', error);
            throw error;
        }
    }

    /**
     * Bulk update departments
     * @param {Array} updates - Array of department updates
     * @returns {Promise<Object>} - Bulk update response
     */
    async bulkUpdateDepartments(updates) {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.DEPARTMENTS}/bulk`, {
                updates,
            });
            return response.data;
        } catch (error) {
            console.error('Bulk update departments error:', error);
            throw error;
        }
    }
}

export const departmentsAPI = new DepartmentAPI();