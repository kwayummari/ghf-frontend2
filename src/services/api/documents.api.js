import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

class DocumentsAPI {
    /**
     * Upload a document
     * @param {File} file - File to upload
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} - Upload result
     */
    async upload(file, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Add metadata
            Object.keys(metadata).forEach(key => {
                formData.append(key, metadata[key]);
            });

            const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS_UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(`Upload progress: ${progress}%`);
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to upload file');
        }
    }

    /**
     * Get document by ID
     * @param {number} id - Document ID
     * @returns {Promise<Object>} - Document data
     */
    async getById(id) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get document error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to get document');
        }
    }

    /**
     * Download document
     * @param {number} id - Document ID
     * @returns {Promise<Blob>} - File blob
     */
    async download(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS_DOWNLOAD(id), {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Download error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to download file');
        }
    }

    /**
     * Delete document
     * @param {number} id - Document ID
     * @returns {Promise<Object>} - Delete result
     */
    async delete(id) {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete document error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete document');
        }
    }

    /**
     * Get user's documents
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Documents data
     */
    async getMyDocuments(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS_MY, { params });
            return response.data;
        } catch (error) {
            console.error('Get my documents error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to get documents');
        }
    }
}

// Create and export a singleton instance
const documentsAPI = new DocumentsAPI();
export { documentsAPI };

// Also export the class for potential custom instances
export default DocumentsAPI;