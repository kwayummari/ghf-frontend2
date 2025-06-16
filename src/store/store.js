import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import departmentReducer from './slices/departmentSlice';

// Configure the Redux store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        attendance: attendanceReducer,
        departments: departmentReducer,
        // Add other reducers here as we create them
        // employees: employeeReducer,
        // leaves: leaveReducer,
        // attendance: attendanceReducer,
        // departments: departmentReducer,
        // documents: documentReducer,
        // menus: menuReducer,
        // roles: roleReducer,
        // notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                // Ignore these field paths in all actions
                ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['auth.user.lastActivity'],
            },
        }),
    devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

export default store;