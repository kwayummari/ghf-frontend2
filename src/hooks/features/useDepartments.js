import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
    fetchDepartments,
    fetchDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    fetchDepartmentEmployees,
    fetchDepartmentStats,
    fetchPotentialHeads,
    assignDepartmentHead,
    setFilters,
    setPagination,
    clearError,
    clearCurrentDepartment,
    clearDepartmentEmployees,
    selectDepartments,
    selectCurrentDepartment,
    selectDepartmentEmployees,
    selectDepartmentStats,
    selectPotentialHeads,
    selectDepartmentsLoading,
    selectDepartmentsError,
    selectDepartmentsPagination,
    selectDepartmentsFilters,
    selectEmployeesPagination,
} from '../../store/slices/departmentSlice';

export const useDepartments = () => {
    const dispatch = useDispatch();

    // Selectors
    const departments = useSelector(selectDepartments);
    const currentDepartment = useSelector(selectCurrentDepartment);
    const potentialHeads = useSelector(selectPotentialHeads);
    const loading = useSelector(selectDepartmentsLoading);
    const error = useSelector(selectDepartmentsError);
    const pagination = useSelector(selectDepartmentsPagination);
    const filters = useSelector(selectDepartmentsFilters);

    // Actions
    const loadDepartments = useCallback((params = {}) => {
        return dispatch(fetchDepartments(params));
    }, [dispatch]);

    const loadDepartmentById = useCallback((id) => {
        return dispatch(fetchDepartmentById(id));
    }, [dispatch]);

    const createNewDepartment = useCallback((departmentData) => {
        return dispatch(createDepartment(departmentData));
    }, [dispatch]);

    const updateExistingDepartment = useCallback((id, data) => {
        return dispatch(updateDepartment({ id, data }));
    }, [dispatch]);

    const removeDepartment = useCallback((id) => {
        return dispatch(deleteDepartment(id));
    }, [dispatch]);

    const loadDepartmentEmployees = useCallback((id, params = {}) => {
        return dispatch(fetchDepartmentEmployees({ id, params }));
    }, [dispatch]);

    const loadDepartmentStats = useCallback((id) => {
        return dispatch(fetchDepartmentStats(id));
    }, [dispatch]);

    const loadPotentialHeads = useCallback(() => {
        return dispatch(fetchPotentialHeads());
    }, [dispatch]);

    const setDepartmentHead = useCallback((departmentId, userId) => {
        return dispatch(assignDepartmentHead({ departmentId, userId }));
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setPagination(newPagination));
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentDepartment());
    }, [dispatch]);

    const clearEmployees = useCallback((departmentId) => {
        dispatch(clearDepartmentEmployees(departmentId));
    }, [dispatch]);

    return {
        // State
        departments,
        currentDepartment,
        potentialHeads,
        loading,
        error,
        pagination,
        filters,

        // Actions
        loadDepartments,
        loadDepartmentById,
        createNewDepartment,
        updateExistingDepartment,
        removeDepartment,
        loadDepartmentEmployees,
        loadDepartmentStats,
        loadPotentialHeads,
        setDepartmentHead,
        updateFilters,
        updatePagination,
        clearErrors,
        clearCurrent,
        clearEmployees,
    };
};

export const useDepartmentEmployees = (departmentId) => {
    const dispatch = useDispatch();

    const employees = useSelector(selectDepartmentEmployees(departmentId));
    const pagination = useSelector(selectEmployeesPagination(departmentId));

    const loadEmployees = useCallback((params = {}) => {
        return dispatch(fetchDepartmentEmployees({ id: departmentId, params }));
    }, [dispatch, departmentId]);

    const clearEmployees = useCallback(() => {
        dispatch(clearDepartmentEmployees(departmentId));
    }, [dispatch, departmentId]);

    return {
        employees,
        pagination,
        loadEmployees,
        clearEmployees,
    };
};

export const useDepartmentStats = (departmentId) => {
    const dispatch = useDispatch();

    const stats = useSelector(selectDepartmentStats(departmentId));

    const loadStats = useCallback(() => {
        return dispatch(fetchDepartmentStats(departmentId));
    }, [dispatch, departmentId]);

    return {
        stats,
        loadStats,
    };
};

export default useDepartments;