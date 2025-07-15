// hooks/common/useSaveState.js

import { useState, useCallback } from 'react';
import useNotification from './useNotification';

const useSaveState = () => {
    const [savedSteps, setSavedSteps] = useState(new Set());
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const { showSuccess, showError } = useNotification();

    const markStepAsSaved = useCallback((stepIndex) => {
        setSavedSteps(prev => new Set([...prev, stepIndex]));
        setHasUnsavedChanges(false);
    }, []);

    const markStepAsUnsaved = useCallback((stepIndex) => {
        setSavedSteps(prev => {
            const newSet = new Set(prev);
            newSet.delete(stepIndex);
            return newSet;
        });
        setHasUnsavedChanges(true);
    }, []);

    const isStepSaved = useCallback((stepIndex) => {
        return savedSteps.has(stepIndex);
    }, [savedSteps]);

    const resetSaveState = useCallback(() => {
        setSavedSteps(new Set());
        setHasUnsavedChanges(false);
        setSaveLoading(false);
    }, []);

    const handleSaveStep = useCallback(async (stepIndex, saveFunction, stepName) => {
        setSaveLoading(true);

        try {
            await saveFunction();
            markStepAsSaved(stepIndex);
            showSuccess(`${stepName} saved successfully`);
            return true;
        } catch (error) {
            showError(error.message || 'Failed to save step data');
            return false;
        } finally {
            setSaveLoading(false);
        }
    }, [markStepAsSaved, showSuccess, showError]);

    const validateStepBeforeNext = useCallback((stepIndex, isEditMode) => {
        if (isEditMode && hasUnsavedChanges && !isStepSaved(stepIndex)) {
            showError('Please save your changes before moving to the next step');
            return false;
        }
        return true;
    }, [hasUnsavedChanges, isStepSaved, showError]);

    return {
        savedSteps,
        hasUnsavedChanges,
        saveLoading,
        markStepAsSaved,
        markStepAsUnsaved,
        isStepSaved,
        resetSaveState,
        handleSaveStep,
        validateStepBeforeNext,
        setHasUnsavedChanges,
    };
};

export default useSaveState;