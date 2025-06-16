import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export class DepartmentAPI {
    /**
     * Get all departments
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Departments list
     */
    async getAllDepartments(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DEPARTMENTS, {
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                    search: params.search || '',
                    sort_by: params.sortBy || 'department_name',
                    sort_order: params.sortOrder || 'ASC',
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Get departments error:', error);
            throw error;
        }
    }

    /**
     * Get department by ID
     * @param {number} id - Department ID
     * @returns {Promise<Object>} - Department data
     */
    async getDepartmentById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DEPARTMENT_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Get department error:', error);
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
            const response = await apiClient.post(API_ENDPOINTS.DEPARTMENTS, {
                department_name: departmentData.department_name,
                description: departmentData.description,
                head_id: departmentData.head_id || null,
                budget: departmentData.budget || null,
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
                description: departmentData.description,
                head_id: departmentData.head_id || null,
                budget: departmentData.budget || null,
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
     * Get department employees
     * @param {number} id - Department ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Department employees
     */
    async getDepartmentEmployees(id, params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DEPARTMENT_EMPLOYEES(id), {
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                    status: params.status || '',
                    position: params.position || '',
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Get department employees error:', error);
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
     * Get all employees (for department head selection)
     * @returns {Promise<Object>} - Employees list
     */
    async getPotentialHeads() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USERS, {
                params: {
                    limit: 1000,
                    status: 'active',
                    roles: 'Department Head,HR Manager,Admin',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Get potential heads error:', error);
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
            const response = await apiClient.put(`${API_ENDPOINTS.DEPARTMENT_BY_ID(departmentId)}/head`, {
                head_id: userId,
            });
            return response.data;
        } catch (error) {
            console.error('Assign department head error:', error);
            throw error;
        }
    }

    /**
     * Get department budget details
     * @param {number} id - Department ID
     * @param {string} year - Budget year
     * @returns {Promise<Object>} - Budget details
     */
    async getDepartmentBudget(id, year = new Date().getFullYear()) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.DEPARTMENT_BY_ID(id)}/budget`, {
                params: { year },
            });
            return response.data;
        } catch (error) {
            console.error('Get department budget error:', error);
            throw error;
        }
    }

    /**
     * Update department budget
     * @param {number} id - Department ID
     * @param {Object} budgetData - Budget data
     * @returns {Promise<Object>} - Updated budget
     */
    async updateDepartmentBudget(id, budgetData) {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.DEPARTMENT_BY_ID(id)}/budget`, budgetData);
            return response.data;
        } catch (error) {
            console.error('Update department budget error:', error);
            throw error;
        }
    }
}

export const departmentsAPI = new DepartmentAPI();