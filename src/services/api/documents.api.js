import apiClient, { uploadFile } from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const documentsAPI = {
    getAll: (params = {}) => apiClient.get(API_ENDPOINTS.DOCUMENTS, { params }),
    getMy: (params = {}) => apiClient.get(API_ENDPOINTS.DOCUMENTS_MY, { params }),
    getByUser: (userId, params = {}) => apiClient.get(API_ENDPOINTS.DOCUMENTS_USER(userId), { params }),
    getById: (id) => apiClient.get(`${API_ENDPOINTS.DOCUMENTS}/${id}`),
    upload: (file, metadata = {}) => uploadFile(API_ENDPOINTS.DOCUMENTS_UPLOAD, file, metadata),
    download: (id, filename) => apiClient.get(API_ENDPOINTS.DOCUMENTS_DOWNLOAD(id), {
        responseType: 'blob',
    }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }),
    update: (id, data) => apiClient.put(`${API_ENDPOINTS.DOCUMENTS}/${id}`, data),
    delete: (id) => apiClient.delete(`${API_ENDPOINTS.DOCUMENTS}/${id}`),
};