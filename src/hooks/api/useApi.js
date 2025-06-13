import { useState, useCallback } from 'react';
import apiClient from '../../services/api/axios.config';
import useNotification from '../common/useNotification';

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showError } = useNotification();

    const request = useCallback(async (config, options = {}) => {
        const {
            showErrorNotification = true,
            onSuccess,
            onError,
        } = options;

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient(config);

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            const errorMessage = err.userMessage || err.message || 'An error occurred';
            setError(errorMessage);

            if (showErrorNotification) {
                showError(errorMessage);
            }

            if (onError) {
                onError(err);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [showError]);

    const get = useCallback((url, options = {}) => {
        return request({ method: 'GET', url }, options);
    }, [request]);

    const post = useCallback((url, data, options = {}) => {
        return request({ method: 'POST', url, data }, options);
    }, [request]);

    const put = useCallback((url, data, options = {}) => {
        return request({ method: 'PUT', url, data }, options);
    }, [request]);

    const patch = useCallback((url, data, options = {}) => {
        return request({ method: 'PATCH', url, data }, options);
    }, [request]);

    const del = useCallback((url, options = {}) => {
        return request({ method: 'DELETE', url }, options);
    }, [request]);

    return {
        loading,
        error,
        request,
        get,
        post,
        put,
        patch,
        delete: del,
    };
};

export default useApi;