import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const authAPI = {
    login: (credentials) => apiClient.post(API_ENDPOINTS.LOGIN, credentials),
    register: (userData) => apiClient.post(API_ENDPOINTS.REGISTER, userData),
    refreshToken: (refreshToken) => apiClient.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh_token: refreshToken }),
    getProfile: () => apiClient.get(API_ENDPOINTS.PROFILE),
    changePassword: (passwordData) => apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, passwordData),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (resetData) => apiClient.post('/auth/reset-password', resetData),
};