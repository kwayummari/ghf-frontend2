import axios from 'axios';
import { AUTH_CONSTANTS } from '../../constants';

// Create axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://185.172.57.203:3000/api/v1',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: new Date() };

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
    (response) => {
        // Calculate request duration
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;

        // Log successful requests in development
        if (import.meta.env.DEV) {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Log error requests in development
        if (import.meta.env.DEV) {
            console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`, error.response?.status, error.message);
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);

                if (refreshToken) {
                    // Attempt to refresh token
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
                        { refresh_token: refreshToken }
                    );

                    const { access_token, refresh_token: newRefreshToken } = response.data.data;

                    // Update tokens in localStorage
                    localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, access_token);
                    if (newRefreshToken) {
                        localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, newRefreshToken);
                    }

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Clear auth data and redirect to login
                localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
                localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
                localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);

                // Redirect to login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorMessage = data?.message || 'Bad request. Please check your input.';
                    break;
                case 401:
                    errorMessage = 'You are not authorized to perform this action.';
                    break;
                case 403:
                    errorMessage = 'You do not have permission to access this resource.';
                    break;
                case 404:
                    errorMessage = 'The requested resource was not found.';
                    break;
                case 422:
                    errorMessage = data?.message || 'Validation failed. Please check your input.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    errorMessage = 'Internal server error. Please try again later.';
                    break;
                case 503:
                    errorMessage = 'Service unavailable. Please try again later.';
                    break;
                default:
                    errorMessage = data?.message || `Server error (${status})`;
            }

            // Add validation errors if available
            if (data?.errors && Array.isArray(data.errors)) {
                error.validationErrors = data.errors;
            }
        } else if (error.request) {
            // Network error
            errorMessage = 'Network error. Please check your connection and try again.';
        }

        error.userMessage = errorMessage;
        return Promise.reject(error);
    }
);

// Helper function to handle file uploads
export const createFormData = (data, fileField = 'file') => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
        if (key === fileField && data[key] instanceof File) {
            formData.append(key, data[key]);
        } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
        }
    });

    return formData;
};

// Helper function for file uploads
export const uploadFile = async (url, file, additionalData = {}) => {
    const formData = createFormData({ ...additionalData, file });

    return apiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // You can use this for progress bars
            console.log(`Upload Progress: ${percentCompleted}%`);
        },
    });
};

// Helper function to download files
export const downloadFile = async (url, filename) => {
    try {
        const response = await apiClient.get(url, {
            responseType: 'blob',
        });

        // Create blob link to download
        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename || 'download';
        link.click();

        // Clean up
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
    return !!token;
};

// Helper function to get current user data
export const getCurrentUser = () => {
    const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

// Helper function to clear auth data
export const clearAuthData = () => {
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
};

export default apiClient;