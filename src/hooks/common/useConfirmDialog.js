import { useState, useCallback } from 'react';

const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'warning',
    });

    const openDialog = useCallback(({
        title = 'Confirm Action',
        message = 'Are you sure you want to proceed?',
        onConfirm = () => { },
        variant = 'warning',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
    }) => {
        setConfig({
            title,
            message,
            onConfirm,
            variant,
            confirmText,
            cancelText,
        });
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleConfirm = useCallback(() => {
        config.onConfirm();
        closeDialog();
    }, [config, closeDialog]);

    return {
        isOpen,
        config,
        openDialog,
        closeDialog,
        handleConfirm,
    };
};

export default useConfirmDialog;