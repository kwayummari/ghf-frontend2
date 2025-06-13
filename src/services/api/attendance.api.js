import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const attendanceAPI = {
    clockIn: (data) => apiClient.post(API_ENDPOINTS.ATTENDANCE_CLOCK_IN, data),
    clockOut: (data) => apiClient.post(API_ENDPOINTS.ATTENDANCE_CLOCK_OUT, data),
    getMy: (params = {}) => apiClient.get(API_ENDPOINTS.ATTENDANCE_MY, { params }),
    getByEmployee: (employeeId, params = {}) => apiClient.get(API_ENDPOINTS.ATTENDANCE_EMPLOYEE(employeeId), { params }),
    getDepartmentReport: (departmentId, params = {}) => apiClient.get(API_ENDPOINTS.ATTENDANCE_DEPARTMENT_REPORT(departmentId), { params }),
    update: (id, data) => apiClient.put(`${API_ENDPOINTS.ATTENDANCE}/${id}`, data),
    getWorkSchedule: () => apiClient.get(API_ENDPOINTS.ATTENDANCE_WORK_SCHEDULE),
    updateWorkSchedule: (id, data) => apiClient.put(`${API_ENDPOINTS.ATTENDANCE_WORK_SCHEDULE}/${id}`, data),
    getHolidays: (params = {}) => apiClient.get(API_ENDPOINTS.ATTENDANCE_HOLIDAYS, { params }),
    createHoliday: (data) => apiClient.post(API_ENDPOINTS.ATTENDANCE_HOLIDAYS, data),
    updateHoliday: (id, data) => apiClient.put(`${API_ENDPOINTS.ATTENDANCE_HOLIDAYS}/${id}`, data),
    deleteHoliday: (id) => apiClient.delete(`${API_ENDPOINTS.ATTENDANCE_HOLIDAYS}/${id}`),
};