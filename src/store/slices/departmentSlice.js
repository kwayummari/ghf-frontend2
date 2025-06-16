import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentsAPI } from '../../services/api';

// Async thunks
export const fetchDepartments = createAsyncThunk(
    'departments/fetchDepartments',
    async (params, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getAllDepartments(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
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
            return rejectWithValue(error.userMessage || error.message);
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
            return rejectWithValue(error.userMessage || error.message);
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
            return rejectWithValue(error.userMessage || error.message);
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
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const fetchDepartmentEmployees = createAsyncThunk(
    'departments/fetchDepartmentEmployees',
    async ({ id, params }, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getDepartmentEmployees(id, params);
            return { departmentId: id, data: response };
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const fetchDepartmentStats = createAsyncThunk(
    'departments/fetchDepartmentStats',
    async (id, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getDepartmentStats(id);
            return { departmentId: id, stats: response.data };
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const fetchPotentialHeads = createAsyncThunk(
    'departments/fetchPotentialHeads',
    async (_, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.getPotentialHeads();
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const assignDepartmentHead = createAsyncThunk(
    'departments/assignDepartmentHead',
    async ({ departmentId, userId }, { rejectWithValue }) => {
        try {
            const response = await departmentsAPI.assignDepartmentHead(departmentId, userId);
            return { departmentId, userId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

// Initial state
const initialState = {
    departments: [],
    currentDepartment: null,
    departmentEmployees: {},
    departmentStats: {},
    potentialHeads: [],
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
        sortBy: 'department_name',
        sortOrder: 'ASC',
    },
    employeesPagination: {},
};

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
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearDepartmentEmployees: (state, action) => {
            if (action.payload) {
                delete state.departmentEmployees[action.payload];
                delete state.employeesPagination[action.payload];
            } else {
                state.departmentEmployees = {};
                state.employeesPagination = {};
            }
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
                state.departments = action.payload.data || action.payload;
                state.pagination = {
                    page: action.payload.currentPage || 1,
                    limit: action.payload.limit || 10,
                    total: action.payload.total || state.departments.length,
                    totalPages: action.payload.totalPages || Math.ceil((action.payload.total || state.departments.length) / (action.payload.limit || 10)),
                };
                state.error = null;
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
                state.error = null;
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
                state.pagination.total += 1;
                state.error = null;
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
                const index = state.departments.findIndex(dept => dept.id === action.payload.id);
                if (index !== -1) {
                    state.departments[index] = action.payload;
                }
                if (state.currentDepartment && state.currentDepartment.id === action.payload.id) {
                    state.currentDepartment = action.payload;
                }
                state.error = null;
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
                state.departments = state.departments.filter(dept => dept.id !== action.payload);
                state.pagination.total -= 1;
                if (state.currentDepartment && state.currentDepartment.id === action.payload) {
                    state.currentDepartment = null;
                }
                state.error = null;
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch department employees
            .addCase(fetchDepartmentEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartmentEmployees.fulfilled, (state, action) => {
                state.loading = false;
                const { departmentId, data } = action.payload;
                state.departmentEmployees[departmentId] = data.data || data;
                state.employeesPagination[departmentId] = {
                    page: data.currentPage || 1,
                    limit: data.limit || 10,
                    total: data.total || (data.data || data).length,
                    totalPages: data.totalPages || Math.ceil((data.total || (data.data || data).length) / (data.limit || 10)),
                };
                state.error = null;
            })
            .addCase(fetchDepartmentEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch department stats
            .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
                const { departmentId, stats } = action.payload;
                state.departmentStats[departmentId] = stats;
            })

            // Fetch potential heads
            .addCase(fetchPotentialHeads.fulfilled, (state, action) => {
                state.potentialHeads = action.payload;
            })

            // Assign department head
            .addCase(assignDepartmentHead.fulfilled, (state, action) => {
                const { departmentId, userId } = action.payload;
                const department = state.departments.find(dept => dept.id === departmentId);
                if (department) {
                    department.head_id = userId;
                }
                if (state.currentDepartment && state.currentDepartment.id === departmentId) {
                    state.currentDepartment.head_id = userId;
                }
            });
    },
});

// Export actions
export const {
    clearError,
    clearCurrentDepartment,
    setFilters,
    setPagination,
    clearDepartmentEmployees,
} = departmentSlice.actions;

// Selectors
export const selectDepartments = (state) => state.departments.departments;
export const selectCurrentDepartment = (state) => state.departments.currentDepartment;
export const selectDepartmentEmployees = (departmentId) => (state) =>
    state.departments.departmentEmployees[departmentId] || [];
export const selectDepartmentStats = (departmentId) => (state) =>
    state.departments.departmentStats[departmentId] || {};
export const selectPotentialHeads = (state) => state.departments.potentialHeads;
export const selectDepartmentsLoading = (state) => state.departments.loading;
export const selectDepartmentsError = (state) => state.departments.error;
export const selectDepartmentsPagination = (state) => state.departments.pagination;
export const selectDepartmentsFilters = (state) => state.departments.filters;
export const selectEmployeesPagination = (departmentId) => (state) =>
    state.departments.employeesPagination[departmentId] || { page: 1, limit: 10, total: 0, totalPages: 0 };

export default departmentSlice.reducer;