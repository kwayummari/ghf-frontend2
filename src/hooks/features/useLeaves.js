import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useApi from '../api/useApi';
import { API_ENDPOINTS } from '../../constants';

const useLeaves = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const {
        data: leaves = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['leaves'],
        queryFn: () => api.get(API_ENDPOINTS.LEAVES),
    });

    const {
        data: leaveTypes = [],
        isLoading: typesLoading,
    } = useQuery({
        queryKey: ['leave-types'],
        queryFn: () => api.get(API_ENDPOINTS.LEAVE_TYPES),
    });

    const createLeave = useMutation({
        mutationFn: (leaveData) => api.post(API_ENDPOINTS.LEAVES, leaveData),
        onSuccess: () => {
            queryClient.invalidateQueries(['leaves']);
        },
    });

    const updateLeaveStatus = useMutation({
        mutationFn: ({ id, status, comment }) =>
            api.put(API_ENDPOINTS.LEAVE_STATUS(id), { status, comment }),
        onSuccess: () => {
            queryClient.invalidateQueries(['leaves']);
        },
    });

    return {
        leaves,
        leaveTypes,
        isLoading,
        typesLoading,
        error,
        refetch,
        createLeave,
        updateLeaveStatus,
    };
};

export default useLeaves;