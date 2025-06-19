import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const meetingsAPI = {
    // Meeting Management
    getAllMeetings: (params = {}) => apiClient.get(API_ENDPOINTS.MEETINGS, { params }),
    getMeetingById: (id) => apiClient.get(API_ENDPOINTS.MEETING_BY_ID(id)),
    createMeeting: (meetingData) => apiClient.post(API_ENDPOINTS.MEETINGS, meetingData),
    updateMeeting: (id, meetingData) => apiClient.put(API_ENDPOINTS.MEETING_BY_ID(id), meetingData),
    deleteMeeting: (id) => apiClient.delete(API_ENDPOINTS.MEETING_BY_ID(id)),

    // Meeting Status Management
    startMeeting: (id) => apiClient.put(`${API_ENDPOINTS.MEETING_BY_ID(id)}/start`),
    completeMeeting: (id, completionData) => apiClient.put(`${API_ENDPOINTS.MEETING_BY_ID(id)}/complete`, completionData),
    cancelMeeting: (id, cancellationData) => apiClient.put(`${API_ENDPOINTS.MEETING_BY_ID(id)}/cancel`, cancellationData),

    // Meeting Attendees
    addAttendee: (meetingId, attendeeData) => apiClient.post(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/attendees`, attendeeData),
    removeAttendee: (meetingId, attendeeId) => apiClient.delete(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/attendees/${attendeeId}`),
    updateAttendeeStatus: (meetingId, attendeeId, statusData) => apiClient.put(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/attendees/${attendeeId}`, statusData),
    getMeetingAttendees: (meetingId) => apiClient.get(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/attendees`),

    // Meeting Agenda
    updateAgenda: (meetingId, agendaData) => apiClient.put(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/agenda`, agendaData),
    getAgenda: (meetingId) => apiClient.get(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/agenda`),
    addAgendaItem: (meetingId, agendaItem) => apiClient.post(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/agenda-items`, agendaItem),
    updateAgendaItem: (meetingId, itemId, itemData) => apiClient.put(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/agenda-items/${itemId}`, itemData),

    // Meeting Minutes
    uploadMinutes: (meetingId, minutesData) => apiClient.post(API_ENDPOINTS.MEETING_MINUTES(meetingId), minutesData),
    getMinutes: (meetingId) => apiClient.get(API_ENDPOINTS.MEETING_MINUTES(meetingId)),
    updateMinutes: (meetingId, minutesData) => apiClient.put(API_ENDPOINTS.MEETING_MINUTES(meetingId), minutesData),
    downloadMinutes: (meetingId) => apiClient.get(`${API_ENDPOINTS.MEETING_MINUTES(meetingId)}/download`, {
        responseType: 'blob'
    }),

    // Meeting Documents
    getMeetingDocuments: (meetingId) => apiClient.get(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/documents`),
    uploadMeetingDocument: (meetingId, documentData) => apiClient.post(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/documents`, documentData),
    deleteMeetingDocument: (meetingId, documentId) => apiClient.delete(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/documents/${documentId}`),

    // Meeting Tasks Management
    getAllTasks: (params = {}) => apiClient.get(API_ENDPOINTS.MEETING_TASKS, { params }),
    getTaskById: (id) => apiClient.get(API_ENDPOINTS.MEETING_TASK_BY_ID(id)),
    createTask: (taskData) => apiClient.post(API_ENDPOINTS.MEETING_TASKS, taskData),
    updateTask: (id, taskData) => apiClient.put(API_ENDPOINTS.MEETING_TASK_BY_ID(id), taskData),
    deleteTask: (id) => apiClient.delete(API_ENDPOINTS.MEETING_TASK_BY_ID(id)),

    // Task Assignment & Management
    assignTask: (taskData) => apiClient.post(API_ENDPOINTS.ASSIGN_TASK, taskData),
    updateTaskProgress: (taskId, progressData) => apiClient.put(`${API_ENDPOINTS.MEETING_TASK_BY_ID(taskId)}/progress`, progressData),
    completeTask: (taskId, completionData) => apiClient.put(`${API_ENDPOINTS.MEETING_TASK_BY_ID(taskId)}/complete`, completionData),
    getTasksByMeeting: (meetingId) => apiClient.get(`${API_ENDPOINTS.MEETING_BY_ID(meetingId)}/tasks`),
    getTasksByAssignee: (userId, params = {}) => apiClient.get(`${API_ENDPOINTS.MEETING_TASKS}/assignee/${userId}`, { params }),

    // Task Follow-up
    addTaskComment: (taskId, commentData) => apiClient.post(`${API_ENDPOINTS.MEETING_TASK_BY_ID(taskId)}/comments`, commentData),
    getTaskComments: (taskId) => apiClient.get(`${API_ENDPOINTS.MEETING_TASK_BY_ID(taskId)}/comments`),
    updateTaskDeadline: (taskId, deadlineData) => apiClient.put(`${API_ENDPOINTS.MEETING_TASK_BY_ID(taskId)}/deadline`, deadlineData),
}