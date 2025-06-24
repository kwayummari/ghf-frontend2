import axios from 'axios';
import { AUTH_CONSTANTS, API_ENDPOINTS } from '../../constants';

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
                    // FIXED: Use correct endpoint and request format
                    const response = await axios.post(
                        `${apiClient.defaults.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`,
                        { refreshToken: refreshToken } // Your backend expects 'refreshToken'
                    );

                    const { data } = response.data;

                    // FIXED: Handle both token field formats from your backend
                    const newAccessToken = data.token || data.access_token;
                    const newRefreshToken = data.refreshToken || data.refresh_token;

                    if (newAccessToken) {
                        // Update tokens in localStorage
                        localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, newAccessToken);

                        if (newRefreshToken) {
                            localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, newRefreshToken);
                        }

                        // Update default headers and retry original request
                        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Clear auth data and redirect to login
                clearAuthData();
                delete apiClient.defaults.headers.common['Authorization'];

                // Redirect to login page if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        let errorMessage = 'An unexpected error occurred';
        let validationErrors = null;

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorMessage = data?.message || 'Bad request. Please check your input.';
                    // FIXED: Handle validation errors from your backend format
                    if (data?.errors && Array.isArray(data.errors)) {
                        validationErrors = data.errors;
                        // Create a more user-friendly message for validation errors
                        const fieldErrors = data.errors.map(err => err.message).join(', ');
                        errorMessage = `Validation failed: ${fieldErrors}`;
                    }
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
                case 409:
                    errorMessage = data?.message || 'Conflict: Resource already exists.';
                    break;
                case 422:
                    errorMessage = data?.message || 'Validation failed. Please check your input.';
                    if (data?.errors && Array.isArray(data.errors)) {
                        validationErrors = data.errors;
                    }
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

            // Add validation errors to the error object
            if (validationErrors) {
                error.validationErrors = validationErrors;
            }
        } else if (error.request) {
            // Network error
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.code === 'ECONNABORTED') {
            // Timeout error
            errorMessage = 'Request timeout. Please try again.';
        }

        // Add user-friendly message to error
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
            // Handle arrays and objects properly
            if (Array.isArray(data[key])) {
                data[key].forEach((item, index) => {
                    formData.append(`${key}[${index}]`, item);
                });
            } else if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, data[key]);
            }
        }
    });

    return formData;
};

// Helper function for file uploads with progress tracking
export const uploadFile = async (url, file, additionalData = {}, onProgress = null) => {
    const formData = createFormData({ ...additionalData, file });

    return apiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

                // Call progress callback if provided
                if (onProgress && typeof onProgress === 'function') {
                    onProgress(percentCompleted);
                }

                // Log progress in development
                if (import.meta.env.DEV) {
                    console.log(`Upload Progress: ${percentCompleted}%`);
                }
            }
        },
    });
};

// Helper function to download files
export const downloadFile = async (url, filename) => {
    try {
        const response = await apiClient.get(url, {
            responseType: 'blob',
        });

        // Get filename from response headers if not provided
        const disposition = response.headers['content-disposition'];
        let downloadFilename = filename;

        if (!downloadFilename && disposition) {
            const filenameMatch = disposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                downloadFilename = filenameMatch[1];
            }
        }

        // Create blob link to download
        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = downloadFilename || 'download';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(link.href);

        return response;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
    const user = getCurrentUser();
    return !!(token && user);
};

// Helper function to get current user data
export const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
        return null;
    }
};

// Helper function to clear auth data
export const clearAuthData = () => {
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
};

// Helper function to get auth token
export const getAuthToken = () => {
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
};

// Initialize auth token on app start
export const initializeAuth = () => {
    const token = getAuthToken();
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

// FIXED: Add retry mechanism for failed requests
export const retryRequest = async (requestConfig, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await apiClient(requestConfig);
        } catch (error) {
            lastError = error;

            // Don't retry on certain status codes
            if (error.response?.status === 400 || error.response?.status === 401 ||
                error.response?.status === 403 || error.response?.status === 404) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (i < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
};

// Call initialization immediately
initializeAuth();

export default apiClient;