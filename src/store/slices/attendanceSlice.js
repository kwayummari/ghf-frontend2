import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceAPI from '../../services/api/attendance.api';

// Async thunks
export const clockIn = createAsyncThunk(
    'attendance/clockIn',
    async (clockInData, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.clockIn(clockInData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const clockOut = createAsyncThunk(
    'attendance/clockOut',
    async (clockOutData, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.clockOut(clockOutData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getMyAttendance = createAsyncThunk(
    'attendance/getMyAttendance',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getMyAttendance(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getEmployeeAttendance = createAsyncThunk(
    'attendance/getEmployeeAttendance',
    async ({ employeeId, params }, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getEmployeeAttendance(employeeId, params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getDepartmentAttendanceReport = createAsyncThunk(
    'attendance/getDepartmentAttendanceReport',
    async ({ departmentId, params }, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getDepartmentAttendanceReport(departmentId, params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getTodayAttendance = createAsyncThunk(
    'attendance/getTodayAttendance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getTodayAttendance();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getAttendanceStats = createAsyncThunk(
    'attendance/getAttendanceStats',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getAttendanceStats(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getWorkSchedule = createAsyncThunk(
    'attendance/getWorkSchedule',
    async (_, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getWorkSchedule();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getHolidays = createAsyncThunk(
    'attendance/getHolidays',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getHolidays(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const createHoliday = createAsyncThunk(
    'attendance/createHoliday',
    async (holidayData, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.createHoliday(holidayData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const updateAttendance = createAsyncThunk(
    'attendance/updateAttendance',
    async ({ attendanceId, updateData }, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.updateAttendance(attendanceId, updateData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

// Initial state
const initialState = {
    // Today's attendance
    todayAttendance: null,
    attendanceStatus: 'not_started', // 'not_started', 'clocked_in', 'completed'

    // Attendance records
    myAttendanceRecords: [],
    employeeAttendanceRecords: [],
    departmentReport: null,

    // Statistics
    attendanceStats: null,

    // Configuration
    workSchedule: null,
    holidays: [],

    // Loading states
    loading: false,
    clockInLoading: false,
    clockOutLoading: false,
    attendanceLoading: false,
    statsLoading: false,
    scheduleLoading: false,
    holidaysLoading: false,

    // Pagination
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    // Error states
    error: null,
};

// Attendance slice
const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearAttendanceData: (state) => {
            state.myAttendanceRecords = [];
            state.employeeAttendanceRecords = [];
            state.departmentReport = null;
        },
        setAttendanceStatus: (state, action) => {
            state.attendanceStatus = action.payload;
        },
        updateTodayAttendance: (state, action) => {
            state.todayAttendance = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Clock in cases
            .addCase(clockIn.pending, (state) => {
                state.clockInLoading = true;
                state.error = null;
            })
            .addCase(clockIn.fulfilled, (state, action) => {
                state.clockInLoading = false;
                state.todayAttendance = action.payload;
                state.attendanceStatus = 'clocked_in';
                state.error = null;
            })
            .addCase(clockIn.rejected, (state, action) => {
                state.clockInLoading = false;
                state.error = action.payload;
            })

            // Clock out cases
            .addCase(clockOut.pending, (state) => {
                state.clockOutLoading = true;
                state.error = null;
            })
            .addCase(clockOut.fulfilled, (state, action) => {
                state.clockOutLoading = false;
                state.todayAttendance = action.payload;
                state.attendanceStatus = 'completed';
                state.error = null;
            })
            .addCase(clockOut.rejected, (state, action) => {
                state.clockOutLoading = false;
                state.error = action.payload;
            })

            // Get my attendance cases
            .addCase(getMyAttendance.pending, (state) => {
                state.attendanceLoading = true;
                state.error = null;
            })
            .addCase(getMyAttendance.fulfilled, (state, action) => {
                state.attendanceLoading = false;

                if (action.payload.attendance) {
                    state.myAttendanceRecords = action.payload.attendance;
                }

                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }

                state.error = null;
            })
            .addCase(getMyAttendance.rejected, (state, action) => {
                state.attendanceLoading = false;
                state.error = action.payload;
            })

            // Get employee attendance cases
            .addCase(getEmployeeAttendance.pending, (state) => {
                state.attendanceLoading = true;
                state.error = null;
            })
            .addCase(getEmployeeAttendance.fulfilled, (state, action) => {
                state.attendanceLoading = false;
                state.employeeAttendanceRecords = action.payload.attendance || [];

                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }

                state.error = null;
            })
            .addCase(getEmployeeAttendance.rejected, (state, action) => {
                state.attendanceLoading = false;
                state.error = action.payload;
            })

            // Get department report cases
            .addCase(getDepartmentAttendanceReport.pending, (state) => {
                state.attendanceLoading = true;
                state.error = null;
            })
            .addCase(getDepartmentAttendanceReport.fulfilled, (state, action) => {
                state.attendanceLoading = false;
                state.departmentReport = action.payload;
                state.error = null;
            })
            .addCase(getDepartmentAttendanceReport.rejected, (state, action) => {
                state.attendanceLoading = false;
                state.error = action.payload;
            })

            // Get today's attendance cases
            .addCase(getTodayAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTodayAttendance.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload.attendance && action.payload.attendance.length > 0) {
                    const todayRecord = action.payload.attendance[0];
                    state.todayAttendance = todayRecord;

                    if (todayRecord.arrival_time && !todayRecord.departure_time) {
                        state.attendanceStatus = 'clocked_in';
                    } else if (todayRecord.arrival_time && todayRecord.departure_time) {
                        state.attendanceStatus = 'completed';
                    } else {
                        state.attendanceStatus = 'not_started';
                    }
                } else {
                    state.attendanceStatus = 'not_started';
                    state.todayAttendance = null;
                }

                state.error = null;
            })
            .addCase(getTodayAttendance.rejected, (state, action) => {
                state.loading = false;
                state.attendanceStatus = 'not_started';
                state.error = action.payload;
            })

            // Get attendance stats cases
            .addCase(getAttendanceStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
            })
            .addCase(getAttendanceStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.attendanceStats = action.payload;
                state.error = null;
            })
            .addCase(getAttendanceStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload;
            })

            // Get work schedule cases
            .addCase(getWorkSchedule.pending, (state) => {
                state.scheduleLoading = true;
                state.error = null;
            })
            .addCase(getWorkSchedule.fulfilled, (state, action) => {
                state.scheduleLoading = false;
                state.workSchedule = action.payload;
                state.error = null;
            })
            .addCase(getWorkSchedule.rejected, (state, action) => {
                state.scheduleLoading = false;
                state.error = action.payload;
            })

            // Get holidays cases
            .addCase(getHolidays.pending, (state) => {
                state.holidaysLoading = true;
                state.error = null;
            })
            .addCase(getHolidays.fulfilled, (state, action) => {
                state.holidaysLoading = false;
                state.holidays = action.payload.holidays || [];
                state.error = null;
            })
            .addCase(getHolidays.rejected, (state, action) => {
                state.holidaysLoading = false;
                state.error = action.payload;
            })

            // Create holiday cases
            .addCase(createHoliday.fulfilled, (state, action) => {
                state.holidays.push(action.payload);
            })

            // Update attendance cases
            .addCase(updateAttendance.fulfilled, (state, action) => {
                const updatedRecord = action.payload;

                // Update in myAttendanceRecords if it exists
                const myIndex = state.myAttendanceRecords.findIndex(
                    record => record.id === updatedRecord.id
                );
                if (myIndex !== -1) {
                    state.myAttendanceRecords[myIndex] = updatedRecord;
                }

                // Update in employeeAttendanceRecords if it exists
                const empIndex = state.employeeAttendanceRecords.findIndex(
                    record => record.id === updatedRecord.id
                );
                if (empIndex !== -1) {
                    state.employeeAttendanceRecords[empIndex] = updatedRecord;
                }
            });
    },
});

// Export actions
export const {
    clearError,
    clearAttendanceData,
    setAttendanceStatus,
    updateTodayAttendance
} = attendanceSlice.actions;

// Selectors
export const selectAttendance = (state) => state.attendance;
export const selectTodayAttendance = (state) => state.attendance.todayAttendance;
export const selectAttendanceStatus = (state) => state.attendance.attendanceStatus;
export const selectMyAttendanceRecords = (state) => state.attendance.myAttendanceRecords;
export const selectEmployeeAttendanceRecords = (state) => state.attendance.employeeAttendanceRecords;
export const selectDepartmentReport = (state) => state.attendance.departmentReport;
export const selectAttendanceStats = (state) => state.attendance.attendanceStats;
export const selectWorkSchedule = (state) => state.attendance.workSchedule;
export const selectHolidays = (state) => state.attendance.holidays;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectClockInLoading = (state) => state.attendance.clockInLoading;
export const selectClockOutLoading = (state) => state.attendance.clockOutLoading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendancePagination = (state) => state.attendance.pagination;
export const selectHolidaysLoading = (state) => state.attendance.holidaysLoading;
export const selectScheduleLoading = (state) => state.attendance.scheduleLoading;

export default attendanceSlice.reducer;