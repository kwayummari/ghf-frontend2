import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/auth/authService';

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData);
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
            return true;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getUserProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getProfile();
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await authService.changePassword(passwordData);
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await authService.updateProfile(profileData);
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

export const getUserMenus = createAsyncThunk(
    'auth/getUserMenus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getUserMenus();
            return response;
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message);
        }
    }
);

// Initial state
const initialState = {
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    userMenus: [],
    loading: false,
    error: null,
    loginLoading: false,
    registerLoading: false,
    profileLoading: false,
    passwordChangeLoading: false,
    menuLoading: false,
};

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.userMenus = [];
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.loginLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loginLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loginLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            // Register cases
            .addCase(registerUser.pending, (state) => {
                state.registerLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.registerLoading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.registerLoading = false;
                state.error = action.payload;
            })

            // Logout cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.userMenus = [];
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                // Still clear user data on logout error
                state.user = null;
                state.isAuthenticated = false;
                state.userMenus = [];
                state.error = action.payload;
            })

            // Get profile cases
            .addCase(getUserProfile.pending, (state) => {
                state.profileLoading = true;
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.error = action.payload;
            })

            // Change password cases
            .addCase(changePassword.pending, (state) => {
                state.passwordChangeLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.passwordChangeLoading = false;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.passwordChangeLoading = false;
                state.error = action.payload;
            })

            // Update profile cases
            .addCase(updateUserProfile.pending, (state) => {
                state.profileLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.error = action.payload;
            })

            // Get user menus cases
            .addCase(getUserMenus.pending, (state) => {
                state.menuLoading = true;
                state.error = null;
            })
            .addCase(getUserMenus.fulfilled, (state, action) => {
                state.menuLoading = false;
                state.userMenus = action.payload;
                state.error = null;
            })
            .addCase(getUserMenus.rejected, (state, action) => {
                state.menuLoading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const { clearError, clearAuth, setUser } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserMenus = (state) => state.auth.userMenus;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginLoading = (state) => state.auth.loginLoading;
export const selectRegisterLoading = (state) => state.auth.registerLoading;
export const selectProfileLoading = (state) => state.auth.profileLoading;
export const selectPasswordChangeLoading = (state) => state.auth.passwordChangeLoading;
export const selectMenuLoading = (state) => state.auth.menuLoading;

// Helper selectors for permissions and roles
export const selectUserRoles = (state) => {
    const user = state.auth.user;
    if (!user || !user.roles) return [];
    return user.roles.map(role =>
        typeof role === 'string' ? role : role.role_name
    );
};

export const selectUserPermissions = (state) => {
    const user = state.auth.user;
    if (!user || !user.permissions) return [];
    return user.permissions.map(permission =>
        typeof permission === 'string' ? permission : permission.name
    );
};

export const selectHasRole = (role) => (state) => {
    const userRoles = selectUserRoles(state);
    return userRoles.includes(role);
};

export const selectHasAnyRole = (roles) => (state) => {
    const userRoles = selectUserRoles(state);
    return roles.some(role => userRoles.includes(role));
};

export const selectHasPermission = (permission) => (state) => {
    const userPermissions = selectUserPermissions(state);
    return userPermissions.includes(permission);
};

export const selectHasAnyPermission = (permissions) => (state) => {
    const userPermissions = selectUserPermissions(state);
    return permissions.some(permission => userPermissions.includes(permission));
};

export default authSlice.reducer;