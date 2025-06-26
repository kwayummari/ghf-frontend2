import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class MeetingsAPI {
    /**
     * Get all meetings with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Meetings data
     */
    async getAllMeetings(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETINGS, { params });
            return response.data;
        } catch (error) {
            console.error('Get meetings error:', error);
            throw error;
        }
    }

    /**
     * Get meeting by ID
     * @param {number} meetingId - Meeting ID
     * @returns {Promise<Object>} - Meeting data
     */
    async getMeetingById(meetingId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETING_BY_ID(meetingId));
            return response.data;
        } catch (error) {
            console.error('Get meeting by ID error:', error);
            throw error;
        }
    }

    /**
     * Create new meeting
     * @param {Object} meetingData - Meeting data
     * @returns {Promise<Object>} - Created meeting
     */
    async createMeeting(meetingData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.MEETINGS, meetingData);
            return response.data;
        } catch (error) {
            console.error('Create meeting error:', error);
            throw error;
        }
    }

    /**
     * Update meeting
     * @param {number} meetingId - Meeting ID
     * @param {Object} meetingData - Updated meeting data
     * @returns {Promise<Object>} - Updated meeting
     */
    async updateMeeting(meetingId, meetingData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.MEETING_BY_ID(meetingId), meetingData);
            return response.data;
        } catch (error) {
            console.error('Update meeting error:', error);
            throw error;
        }
    }

    /**
     * Delete meeting
     * @param {number} meetingId - Meeting ID
     * @returns {Promise<Object>} - Delete result
     */
    async deleteMeeting(meetingId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.MEETING_BY_ID(meetingId));
            return response.data;
        } catch (error) {
            console.error('Delete meeting error:', error);
            throw error;
        }
    }

    /**
     * Update meeting status
     * @param {number} meetingId - Meeting ID
     * @param {string} status - New status
     * @returns {Promise<Object>} - Updated meeting
     */
    async updateMeetingStatus(meetingId, status) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.MEETING_STATUS(meetingId), { status });
            return response.data;
        } catch (error) {
            console.error('Update meeting status error:', error);
            throw error;
        }
    }

    /**
     * Get meeting attendees
     * @param {number} meetingId - Meeting ID
     * @returns {Promise<Object>} - Attendees data
     */
    async getMeetingAttendees(meetingId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETING_ATTENDEES(meetingId));
            return response.data;
        } catch (error) {
            console.error('Get meeting attendees error:', error);
            throw error;
        }
    }

    /**
     * Add attendee to meeting
     * @param {number} meetingId - Meeting ID
     * @param {Object} attendeeData - Attendee data
     * @returns {Promise<Object>} - Added attendee
     */
    async addMeetingAttendee(meetingId, attendeeData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.MEETING_ATTENDEES(meetingId), attendeeData);
            return response.data;
        } catch (error) {
            console.error('Add meeting attendee error:', error);
            throw error;
        }
    }

    /**
     * Update attendee status
     * @param {number} meetingId - Meeting ID
     * @param {number} attendeeId - Attendee ID
     * @param {string} status - Attendance status
     * @returns {Promise<Object>} - Updated attendee
     */
    async updateAttendeeStatus(meetingId, attendeeId, status) {
        try {
            const response = await apiClient.patch(
                API_ENDPOINTS.MEETING_ATTENDEE_STATUS(meetingId, attendeeId),
                { attendance_status: status }
            );
            return response.data;
        } catch (error) {
            console.error('Update attendee status error:', error);
            throw error;
        }
    }

    /**
     * Get meeting tasks
     * @param {number} meetingId - Meeting ID (optional)
     * @returns {Promise<Object>} - Meeting tasks
     */
    async getMeetingTasks(meetingId = null) {
        try {
            const endpoint = meetingId ? API_ENDPOINTS.MEETING_TASKS(meetingId) : API_ENDPOINTS.ALL_MEETING_TASKS;
            const response = await apiClient.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('Get meeting tasks error:', error);
            throw error;
        }
    }

    /**
     * Create meeting task
     * @param {number} meetingId - Meeting ID
     * @param {Object} taskData - Task data
     * @returns {Promise<Object>} - Created task
     */
    async createMeetingTask(meetingId, taskData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.MEETING_TASKS(meetingId), taskData);
            return response.data;
        } catch (error) {
            console.error('Create meeting task error:', error);
            throw error;
        }
    }

    /**
     * Update meeting task
     * @param {number} taskId - Task ID
     * @param {Object} taskData - Updated task data
     * @returns {Promise<Object>} - Updated task
     */
    async updateMeetingTask(taskId, taskData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.MEETING_TASK_BY_ID(taskId), taskData);
            return response.data;
        } catch (error) {
            console.error('Update meeting task error:', error);
            throw error;
        }
    }

    /**
     * Delete meeting task
     * @param {number} taskId - Task ID
     * @returns {Promise<Object>} - Delete result
     */
    async deleteMeetingTask(taskId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.MEETING_TASK_BY_ID(taskId));
            return response.data;
        } catch (error) {
            console.error('Delete meeting task error:', error);
            throw error;
        }
    }

    /**
     * Update task progress
     * @param {number} taskId - Task ID
     * @param {number} progress - Progress percentage
     * @param {string} status - Task status
     * @returns {Promise<Object>} - Updated task
     */
    async updateTaskProgress(taskId, progress, status) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.MEETING_TASK_PROGRESS(taskId), {
                progress,
                status
            });
            return response.data;
        } catch (error) {
            console.error('Update task progress error:', error);
            throw error;
        }
    }

    /**
     * Upload meeting minutes
     * @param {number} meetingId - Meeting ID
     * @param {FormData} formData - File form data
     * @returns {Promise<Object>} - Upload result
     */
    async uploadMeetingMinutes(meetingId, formData) {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.MEETING_MINUTES(meetingId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Upload meeting minutes error:', error);
            throw error;
        }
    }

    /**
     * Get meeting minutes
     * @param {number} meetingId - Meeting ID
     * @returns {Promise<Object>} - Meeting minutes
     */
    async getMeetingMinutes(meetingId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETING_MINUTES(meetingId));
            return response.data;
        } catch (error) {
            console.error('Get meeting minutes error:', error);
            throw error;
        }
    }

    /**
     * Get meeting documents
     * @param {number} meetingId - Meeting ID
     * @returns {Promise<Object>} - Meeting documents
     */
    async getMeetingDocuments(meetingId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETING_DOCUMENTS(meetingId));
            return response.data;
        } catch (error) {
            console.error('Get meeting documents error:', error);
            throw error;
        }
    }

    /**
     * Upload meeting document
     * @param {number} meetingId - Meeting ID
     * @param {FormData} formData - File form data
     * @returns {Promise<Object>} - Upload result
     */
    async uploadMeetingDocument(meetingId, formData) {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.MEETING_DOCUMENTS(meetingId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Upload meeting document error:', error);
            throw error;
        }
    }

    /**
     * Get user's meetings (upcoming, today, etc.)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - User meetings
     */
    async getUserMeetings(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER_MEETINGS, { params });
            return response.data;
        } catch (error) {
            console.error('Get user meetings error:', error);
            throw error;
        }
    }

    /**
     * Get meeting statistics
     * @param {Object} params - Query parameters (date range, department, etc.)
     * @returns {Promise<Object>} - Meeting statistics
     */
    async getMeetingStatistics(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETING_STATISTICS, { params });
            return response.data;
        } catch (error) {
            console.error('Get meeting statistics error:', error);
            throw error;
        }
    }

    /**
     * Send meeting notifications
     * @param {number} meetingId - Meeting ID
     * @param {Object} notificationData - Notification data
     * @returns {Promise<Object>} - Notification result
     */
    async sendMeetingNotifications(meetingId, notificationData) {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.MEETING_NOTIFICATIONS(meetingId),
                notificationData
            );
            return response.data;
        } catch (error) {
            console.error('Send meeting notifications error:', error);
            throw error;
        }
    }

    /**
     * Generate meeting report
     * @param {Object} params - Report parameters
     * @returns {Promise<Blob>} - Report file
     */
    async generateMeetingReport(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MEETING_REPORTS, {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Generate meeting report error:', error);
            throw error;
        }
    }
}

const meetingsAPI = new MeetingsAPI();
export default meetingsAPI;