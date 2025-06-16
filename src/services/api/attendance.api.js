import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class AttendanceAPI {
    /**
     * Clock in for attendance
     * @param {Object} clockInData - Clock in data
     * @returns {Promise<Object>} - Clock in response
     */
    async clockIn(clockInData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_CLOCK_IN, clockInData);
            return response.data;
        } catch (error) {
            console.error('Clock in error:', error);
            throw error;
        }
    }

    /**
     * Clock out for attendance
     * @param {Object} clockOutData - Clock out data
     * @returns {Promise<Object>} - Clock out response
     */
    async clockOut(clockOutData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_CLOCK_OUT, clockOutData);
            return response.data;
        } catch (error) {
            console.error('Clock out error:', error);
            throw error;
        }
    }

    /**
     * Get current user's attendance records
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Attendance records
     */
    async getMyAttendance(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE_MY, { params });
            return response.data;
        } catch (error) {
            console.error('Get my attendance error:', error);
            throw error;
        }
    }

    /**
     * Get specific employee's attendance records
     * @param {number} employeeId - Employee ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Employee attendance records
     */
    async getEmployeeAttendance(employeeId, params = {}) {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.ATTENDANCE_EMPLOYEE(employeeId),
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Get employee attendance error:', error);
            throw error;
        }
    }

    /**
     * Get department attendance report
     * @param {number} departmentId - Department ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Department attendance report
     */
    async getDepartmentAttendanceReport(departmentId, params = {}) {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.ATTENDANCE_DEPARTMENT_REPORT(departmentId),
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Get department attendance report error:', error);
            throw error;
        }
    }

    /**
     * Update attendance record (admin function)
     * @param {number} attendanceId - Attendance record ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} - Updated attendance record
     */
    async updateAttendance(attendanceId, updateData) {
        try {
            const response = await apiClient.put(
                `${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`,
                updateData
            );
            return response.data;
        } catch (error) {
            console.error('Update attendance error:', error);
            throw error;
        }
    }

    /**
     * Get work schedule
     * @returns {Promise<Object>} - Work schedule
     */
    async getWorkSchedule() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE_WORK_SCHEDULE);
            return response.data;
        } catch (error) {
            console.error('Get work schedule error:', error);
            throw error;
        }
    }

    /**
     * Update work schedule (admin function)
     * @param {number} scheduleId - Schedule ID
     * @param {Object} scheduleData - Schedule data
     * @returns {Promise<Object>} - Updated schedule
     */
    async updateWorkSchedule(scheduleId, scheduleData) {
        try {
            const response = await apiClient.put(
                `${API_ENDPOINTS.ATTENDANCE_WORK_SCHEDULE}/${scheduleId}`,
                scheduleData
            );
            return response.data;
        } catch (error) {
            console.error('Update work schedule error:', error);
            throw error;
        }
    }

    /**
     * Get holidays
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Holidays list
     */
    async getHolidays(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE_HOLIDAYS, { params });
            return response.data;
        } catch (error) {
            console.error('Get holidays error:', error);
            throw error;
        }
    }

    /**
     * Create holiday (admin function)
     * @param {Object} holidayData - Holiday data
     * @returns {Promise<Object>} - Created holiday
     */
    async createHoliday(holidayData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_HOLIDAYS, holidayData);
            return response.data;
        } catch (error) {
            console.error('Create holiday error:', error);
            throw error;
        }
    }

    /**
     * Update holiday (admin function)
     * @param {number} holidayId - Holiday ID
     * @param {Object} holidayData - Holiday data
     * @returns {Promise<Object>} - Updated holiday
     */
    async updateHoliday(holidayId, holidayData) {
        try {
            const response = await apiClient.put(
                `${API_ENDPOINTS.ATTENDANCE_HOLIDAYS}/${holidayId}`,
                holidayData
            );
            return response.data;
        } catch (error) {
            console.error('Update holiday error:', error);
            throw error;
        }
    }

    /**
     * Delete holiday (admin function)
     * @param {number} holidayId - Holiday ID
     * @returns {Promise<Object>} - Delete response
     */
    async deleteHoliday(holidayId) {
        try {
            const response = await apiClient.delete(
                `${API_ENDPOINTS.ATTENDANCE_HOLIDAYS}/${holidayId}`
            );
            return response.data;
        } catch (error) {
            console.error('Delete holiday error:', error);
            throw error;
        }
    }

    /**
     * Get attendance summary/statistics
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Attendance statistics
     */
    async getAttendanceStats(params = {}) {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.ATTENDANCE}/stats`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Get attendance stats error:', error);
            throw error;
        }
    }

    /**
     * Export attendance report
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} - Export file
     */
    async exportAttendanceReport(params = {}) {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.ATTENDANCE}/export`,
                {
                    params,
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (error) {
            console.error('Export attendance report error:', error);
            throw error;
        }
    }

    /**
     * Get today's attendance status
     * @returns {Promise<Object>} - Today's attendance
     */
    async getTodayAttendance() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE_MY, {
                params: {
                    date: today,
                    limit: 1
                }
            });
            return response.data;
        } catch (error) {
            console.error('Get today attendance error:', error);
            throw error;
        }
    }

    /**
     * Get attendance overview for dashboard
     * @returns {Promise<Object>} - Attendance overview
     */
    async getAttendanceOverview() {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.ATTENDANCE}/overview`);
            return response.data;
        } catch (error) {
            console.error('Get attendance overview error:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const attendanceAPI = new AttendanceAPI();
export default attendanceAPI;