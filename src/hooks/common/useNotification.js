import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

const useNotification = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showSuccess = useCallback((message, options = {}) => {
        return enqueueSnackbar(message, {
            variant: 'success',
            autoHideDuration: 3000,
            ...options,
        });
    }, [enqueueSnackbar]);

    const showError = useCallback((message, options = {}) => {
        return enqueueSnackbar(message, {
            variant: 'error',
            autoHideDuration: 5000,
            ...options,
        });
    }, [enqueueSnackbar]);

    const showWarning = useCallback((message, options = {}) => {
        return enqueueSnackbar(message, {
            variant: 'warning',
            autoHideDuration: 4000,
            ...options,
        });
    }, [enqueueSnackbar]);

    const showInfo = useCallback((message, options = {}) => {
        return enqueueSnackbar(message, {
            variant: 'info',
            autoHideDuration: 3000,
            ...options,
        });
    }, [enqueueSnackbar]);

    const dismiss = useCallback((key) => {
        closeSnackbar(key);
    }, [closeSnackbar]);

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismiss,
    };
};

export default useNotification;