import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useApi from '../api/useApi';
import { API_ENDPOINTS } from '../../constants';

const useEmployees = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const {
        data: employees = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['employees'],
        queryFn: () => api.get(API_ENDPOINTS.EMPLOYEES),
    });

    const createEmployee = useMutation({
        mutationFn: (employeeData) => api.post(API_ENDPOINTS.EMPLOYEES, employeeData),
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
        },
    });

    const updateEmployee = useMutation({
        mutationFn: ({ id, data }) => api.put(API_ENDPOINTS.EMPLOYEE_BY_ID(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
        },
    });

    const deleteEmployee = useMutation({
        mutationFn: (id) => api.delete(API_ENDPOINTS.EMPLOYEE_BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
        },
    });

    return {
        employees,
        isLoading,
        error,
        refetch,
        createEmployee,
        updateEmployee,
        deleteEmployee,
    };
};

export default useEmployees;