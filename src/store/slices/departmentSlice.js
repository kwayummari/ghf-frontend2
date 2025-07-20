import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentsAPI } from '../../services/api/departments.api';

// Initial state
const initialState = {
    departments: [],
    currentDepartment: null,
    potentialHeads: [],
    departmentEmployees: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    filters: {
        search: '',
        status: 'all',
        sortBy: 'department_name',
        sortOrder: 'ASC',
    },
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
    'departments/fetchDepartments',
    async (params, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getAllDepartments(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch departments'
            );
        }
    }
);

export const fetchDepartmentById = createAsyncThunk(
    'departments/fetchDepartmentById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getDepartmentById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch department'
            );
        }
    }
);

export const createDepartment = createAsyncThunk(
    'departments/createDepartment',
    async (departmentData, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.createDepartment(departmentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create department'
            );
        }
    }
);

export const updateDepartment = createAsyncThunk(
    'departments/updateDepartment',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.updateDepartment(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update department'
            );
        }
    }
);

export const deleteDepartment = createAsyncThunk(
    'departments/deleteDepartment',
    async (id, { rejectWithValue }) => {
        try {
            await departmentsAPI.deleteDepartment(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete department'
            );
        }
    }
);

export const fetchPotentialHeads = createAsyncThunk(
    'departments/fetchPotentialHeads',
    async (_, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getPotentialHeads();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch potential heads'
            );
        }
    }
);

export const fetchDepartmentEmployees = createAsyncThunk(
    'departments/fetchDepartmentEmployees',
    async ({ id, params }, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getDepartmentEmployees(id, params);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch department employees'
            );
        }
    }
);

export const toggleDepartmentStatus = createAsyncThunk(
    'departments/toggleDepartmentStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.toggleDepartmentStatus(id, isActive);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle department status'
            );
        }
    }
);

export const assignDepartmentHead = createAsyncThunk(
    'departments/assignDepartmentHead',
    async ({ departmentId, userId }, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.assignDepartmentHead(departmentId, userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to assign department head'
            );
        }
    }
);

// Department slice
const departmentSlice = createSlice({
    name: 'departments',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentDepartment: (state) => {
            state.currentDepartment = null;
        },
        clearDepartmentEmployees: (state) => {
            state.departmentEmployees = [];
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch departments
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload.departments;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch department by ID
            .addCase(fetchDepartmentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDepartment = action.payload;
            })
            .addCase(fetchDepartmentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create department
            .addCase(createDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.departments.unshift(action.payload);
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update department
            .addCase(updateDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.departments.findIndex(
                    (dept) => dept.id === action.payload.id
                );
                if (index !== -1) {
                    state.departments[index] = action.payload;
                }
                if (state.currentDepartment?.id === action.payload.id) {
                    state.currentDepartment = action.payload;
                }
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete department
            .addCase(deleteDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = state.departments.filter(
                    (dept) => dept.id !== action.payload
                );
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch potential heads
            .addCase(fetchPotentialHeads.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchPotentialHeads.fulfilled, (state, action) => {
                state.potentialHeads = action.payload;
            })
            .addCase(fetchPotentialHeads.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Fetch department employees
            .addCase(fetchDepartmentEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartmentEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.departmentEmployees = action.payload.employees;
            })
            .addCase(fetchDepartmentEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Toggle department status
            .addCase(toggleDepartmentStatus.fulfilled, (state, action) => {
                const index = state.departments.findIndex(
                    (dept) => dept.id === action.payload.id
                );
                if (index !== -1) {
                    state.departments[index] = action.payload;
                }
                if (state.currentDepartment?.id === action.payload.id) {
                    state.currentDepartment = action.payload;
                }
            })

            // Assign department head
            .addCase(assignDepartmentHead.fulfilled, (state, action) => {
                const index = state.departments.findIndex(
                    (dept) => dept.id === action.payload.id
                );
                if (index !== -1) {
                    state.departments[index] = action.payload;
                }
                if (state.currentDepartment?.id === action.payload.id) {
                    state.currentDepartment = action.payload;
                }
            });
    },
});

// Export actions
export const {
    clearError,
    clearCurrentDepartment,
    clearDepartmentEmployees,
    setFilters,
    resetFilters,
    setPagination,
} = departmentSlice.actions;

// Selectors
export const selectDepartments = (state) => state.departments.departments;
export const selectCurrentDepartment = (state) => state.departments.currentDepartment;
export const selectPotentialHeads = (state) => state.departments.potentialHeads;
export const selectDepartmentEmployees = (state) => state.departments.departmentEmployees;
export const selectDepartmentsLoading = (state) => state.departments.loading;
export const selectDepartmentsError = (state) => state.departments.error;
export const selectDepartmentsPagination = (state) => state.departments.pagination;
export const selectDepartmentsFilters = (state) => state.departments.filters;

// Complex selectors
export const selectActiveDepartments = (state) =>
    state.departments.departments.filter((dept) => dept.is_active);

export const selectDepartmentsWithHeads = (state) =>
    state.departments.departments.filter((dept) => dept.head);

export const selectDepartmentById = (state, departmentId) =>
    state.departments.departments.find((dept) => dept.id === departmentId);

export const selectDepartmentStats = (state) => {
    const departments = state.departments.departments;
    return {
        total: departments.length,
        active: departments.filter((dept) => dept.is_active).length,
        inactive: departments.filter((dept) => !dept.is_active).length,
        withHeads: departments.filter((dept) => dept.head).length,
        withoutHeads: departments.filter((dept) => !dept.head).length,
        totalBudget: departments.reduce((sum, dept) => sum + (dept.budget || 0), 0),
    };
};

export default departmentSlice.reducer;