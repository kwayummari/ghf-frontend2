// src/hooks/useDialog.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dialog state and actions
 * Provides a simple interface for confirmation dialogs and other modal interactions
 */
export const useDialog = () => {
    const [dialogState, setDialogState] = useState({
        open: false,
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        type: 'confirm', // 'confirm', 'alert', 'custom'
        variant: 'default', // 'default', 'danger', 'warning', 'info'
        onConfirm: null,
        onCancel: null,
        showCancel: true,
        fullWidth: false,
        maxWidth: 'sm',
        loading: false,
    });

    // Open dialog with configuration
    const openDialog = useCallback((config) => {
        setDialogState(prevState => ({
            ...prevState,
            open: true,
            title: config.title || 'Confirm Action',
            message: config.message || 'Are you sure you want to proceed?',
            confirmLabel: config.confirmLabel || 'Confirm',
            cancelLabel: config.cancelLabel || 'Cancel',
            type: config.type || 'confirm',
            variant: config.variant || 'default',
            onConfirm: config.onConfirm || null,
            onCancel: config.onCancel || null,
            showCancel: config.showCancel !== false,
            fullWidth: config.fullWidth || false,
            maxWidth: config.maxWidth || 'sm',
            loading: false,
        }));
    }, []);

    // Close dialog
    const closeDialog = useCallback(() => {
        setDialogState(prevState => ({
            ...prevState,
            open: false,
            loading: false,
        }));
    }, []);

    // Handle confirm action
    const handleConfirm = useCallback(async () => {
        if (dialogState.onConfirm) {
            try {
                setDialogState(prevState => ({ ...prevState, loading: true }));
                await dialogState.onConfirm();
                closeDialog();
            } catch (error) {
                console.error('Dialog confirm action failed:', error);
                setDialogState(prevState => ({ ...prevState, loading: false }));
                // Keep dialog open on error
            }
        } else {
            closeDialog();
        }
    }, [dialogState.onConfirm, closeDialog]);

    // Handle cancel action
    const handleCancel = useCallback(() => {
        if (dialogState.onCancel) {
            dialogState.onCancel();
        }
        closeDialog();
    }, [dialogState.onCancel, closeDialog]);

    // Set loading state
    const setLoading = useCallback((loading) => {
        setDialogState(prevState => ({ ...prevState, loading }));
    }, []);

    return {
        // State
        dialogState,
        isOpen: dialogState.open,

        // Actions
        openDialog,
        closeDialog,
        handleConfirm,
        handleCancel,
        setLoading,

        // Convenience methods for common dialog types
        confirm: useCallback((title, message, onConfirm) => {
            openDialog({
                title,
                message,
                onConfirm,
                variant: 'default',
                type: 'confirm'
            });
        }, [openDialog]),

        alert: useCallback((title, message) => {
            openDialog({
                title,
                message,
                showCancel: false,
                confirmLabel: 'OK',
                type: 'alert'
            });
        }, [openDialog]),

        danger: useCallback((title, message, onConfirm) => {
            openDialog({
                title,
                message,
                onConfirm,
                variant: 'danger',
                confirmLabel: 'Delete',
                type: 'confirm'
            });
        }, [openDialog]),

        warning: useCallback((title, message, onConfirm) => {
            openDialog({
                title,
                message,
                onConfirm,
                variant: 'warning',
                type: 'confirm'
            });
        }, [openDialog]),
    };
};