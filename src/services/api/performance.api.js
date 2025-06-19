import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const performanceAPI = {
    // Performance Appraisals
    getAllAppraisals: (params = {}) => apiClient.get(API_ENDPOINTS.APPRAISALS, { params }),
    getAppraisalById: (id) => apiClient.get(API_ENDPOINTS.APPRAISAL_BY_ID(id)),
    createAppraisal: (appraisalData) => apiClient.post(API_ENDPOINTS.APPRAISALS, appraisalData),
    updateAppraisal: (id, appraisalData) => apiClient.put(API_ENDPOINTS.APPRAISAL_BY_ID(id), appraisalData),
    deleteAppraisal: (id) => apiClient.delete(API_ENDPOINTS.APPRAISAL_BY_ID(id)),

    // Self Assessment
    startSelfAssessment: (appraisalId) => apiClient.post(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/self-assessment/start`),
    submitSelfAssessment: (appraisalId, assessmentData) => apiClient.put(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/self-assessment`, assessmentData),
    getSelfAssessment: (appraisalId) => apiClient.get(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/self-assessment`),

    // Supervisor Review
    startSupervisorReview: (appraisalId) => apiClient.post(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/supervisor-review/start`),
    submitSupervisorReview: (appraisalId, reviewData) => apiClient.put(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/supervisor-review`, reviewData),
    getSupervisorReview: (appraisalId) => apiClient.get(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/supervisor-review`),

    // HR Review
    startHRReview: (appraisalId) => apiClient.post(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/hr-review/start`),
    submitHRReview: (appraisalId, reviewData) => apiClient.put(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/hr-review`, reviewData),
    getHRReview: (appraisalId) => apiClient.get(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/hr-review`),

    // Appraisal Completion
    finalizeAppraisal: (appraisalId, finalizationData) => apiClient.put(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/finalize`, finalizationData),
    reopenAppraisal: (appraisalId, reason) => apiClient.put(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/reopen`, { reason }),

    // Objectives Management
    getAllObjectives: (params = {}) => apiClient.get(API_ENDPOINTS.OBJECTIVES, { params }),
    getObjectiveById: (id) => apiClient.get(API_ENDPOINTS.OBJECTIVE_BY_ID(id)),
    createObjective: (objectiveData) => apiClient.post(API_ENDPOINTS.OBJECTIVES, objectiveData),
    updateObjective: (id, objectiveData) => apiClient.put(API_ENDPOINTS.OBJECTIVE_BY_ID(id), objectiveData),
    deleteObjective: (id) => apiClient.delete(API_ENDPOINTS.OBJECTIVE_BY_ID(id)),

    // Objectives by User/Period
    getObjectivesByUser: (userId, params = {}) => apiClient.get(API_ENDPOINTS.OBJECTIVES_BY_USER(userId), { params }),
    getObjectivesByFiscalYear: (fiscalYearId, params = {}) => apiClient.get(API_ENDPOINTS.OBJECTIVES_BY_FISCAL_YEAR(fiscalYearId), { params }),

    // Objective Progress Tracking
    updateObjectiveProgress: (objectiveId, progressData) => apiClient.put(`${API_ENDPOINTS.OBJECTIVE_BY_ID(objectiveId)}/progress`, progressData),
    completeObjective: (objectiveId, completionData) => apiClient.put(`${API_ENDPOINTS.OBJECTIVE_BY_ID(objectiveId)}/complete`, completionData),
    approveObjective: (objectiveId, approvalData) => apiClient.put(`${API_ENDPOINTS.OBJECTIVE_BY_ID(objectiveId)}/approve`, approvalData),

    // Competency Management
    getCompetencies: () => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/competencies`),
    getCompetencyById: (id) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/competencies/${id}`),
    createCompetency: (competencyData) => apiClient.post(`${API_ENDPOINTS.PERFORMANCE}/competencies`, competencyData),
    updateCompetency: (id, competencyData) => apiClient.put(`${API_ENDPOINTS.PERFORMANCE}/competencies/${id}`, competencyData),

    // Performance Templates
    getAppraisalTemplates: () => apiClient.get(`${API_ENDPOINTS.APPRAISALS}/templates`),
    createAppraisalTemplate: (templateData) => apiClient.post(`${API_ENDPOINTS.APPRAISALS}/templates`, templateData),
    getTemplateById: (id) => apiClient.get(`${API_ENDPOINTS.APPRAISALS}/templates/${id}`),

    // Performance Analytics & Reports
    getPerformanceAnalytics: (params = {}) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/analytics`, { params }),
    getDepartmentPerformance: (departmentId, params = {}) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/department/${departmentId}`, { params }),
    getEmployeePerformanceHistory: (employeeId, params = {}) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/employee/${employeeId}/history`, { params }),
    getObjectiveCompletion: (params = {}) => apiClient.get(`${API_ENDPOINTS.OBJECTIVES}/completion-report`, { params }),

    // Performance Ratings & Calibration
    getRatingDistribution: (params = {}) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/rating-distribution`, { params }),
    performCalibration: (calibrationData) => apiClient.post(`${API_ENDPOINTS.PERFORMANCE}/calibration`, calibrationData),
    getCalibrationResults: (calibrationId) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/calibration/${calibrationId}`),

    // Development Plans
    getDevelopmentPlans: (params = {}) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/development-plans`, { params }),
    createDevelopmentPlan: (planData) => apiClient.post(`${API_ENDPOINTS.PERFORMANCE}/development-plans`, planData),
    updateDevelopmentPlan: (id, planData) => apiClient.put(`${API_ENDPOINTS.PERFORMANCE}/development-plans/${id}`, planData),

    // Performance Periods & Cycles
    getPerformancePeriods: () => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/periods`),
    createPerformancePeriod: (periodData) => apiClient.post(`${API_ENDPOINTS.PERFORMANCE}/periods`, periodData),
    activatePerformancePeriod: (periodId) => apiClient.put(`${API_ENDPOINTS.PERFORMANCE}/periods/${periodId}/activate`),
    closePerformancePeriod: (periodId) => apiClient.put(`${API_ENDPOINTS.PERFORMANCE}/periods/${periodId}/close`),

    // Export Functions
    exportAppraisalReport: (appraisalId) => apiClient.get(`${API_ENDPOINTS.APPRAISAL_BY_ID(appraisalId)}/export`, {
        responseType: 'blob'
    }),
    exportPerformanceReport: (params = {}) => apiClient.get(`${API_ENDPOINTS.PERFORMANCE}/export`, {
        params,
        responseType: 'blob'
    }),
    exportObjectivesReport: (params = {}) => apiClient.get(`${API_ENDPOINTS.OBJECTIVES}/export`, {
        params,
        responseType: 'blob'
    }),
};