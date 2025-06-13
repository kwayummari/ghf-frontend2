// API Constants
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',

    // Users
    USERS: '/users',
    USER_BY_ID: (id) => `/users/${id}`,

    // Employees
    EMPLOYEES: '/users', // Using users endpoint as per backend
    EMPLOYEE_BY_ID: (id) => `/users/${id}`,

    // Departments
    DEPARTMENTS: '/departments',
    DEPARTMENT_BY_ID: (id) => `/departments/${id}`,
    DEPARTMENT_EMPLOYEES: (id) => `/departments/${id}/employees`,

    // Leaves
    LEAVES: '/leaves',
    LEAVE_BY_ID: (id) => `/leaves/${id}`,
    LEAVE_TYPES: '/leaves/types',
    LEAVE_STATUS: (id) => `/leaves/${id}/status`,

    // Attendance
    ATTENDANCE: '/attendance',
    ATTENDANCE_CLOCK_IN: '/attendance/clock-in',
    ATTENDANCE_CLOCK_OUT: '/attendance/clock-out',
    ATTENDANCE_MY: '/attendance/my-attendance',
    ATTENDANCE_EMPLOYEE: (id) => `/attendance/employees/${id}`,
    ATTENDANCE_DEPARTMENT_REPORT: (id) => `/attendance/departments/${id}/report`,
    ATTENDANCE_HOLIDAYS: '/attendance/holidays',
    ATTENDANCE_WORK_SCHEDULE: '/attendance/work-schedule',

    // Documents
    DOCUMENTS: '/documents',
    DOCUMENTS_MY: '/documents/my',
    DOCUMENTS_USER: (id) => `/documents/user/${id}`,
    DOCUMENTS_UPLOAD: '/documents/upload',
    DOCUMENTS_DOWNLOAD: (id) => `/documents/${id}/download`,

    // Roles & Permissions
    ROLES: '/roles',
    ROLE_BY_ID: (id) => `/roles/${id}`,
    PERMISSIONS: '/roles/permissions',
    ROLE_ASSIGN: '/roles/assign',
    ROLE_MENU_PERMISSIONS: (id) => `/roles/${id}/menu-permissions`,

    // Menus
    MENUS: '/menus',
    MENU_BY_ID: (id) => `/menus/${id}`,
    USER_MENUS: '/menus/user',
    ROLE_MENU_ACCESS: (roleId, menuId) => `/menus/roles/${roleId}/menus/${menuId}/access`,
};

// Authentication Constants
export const AUTH_CONSTANTS = {
    TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'ghf_auth_token',
    REFRESH_TOKEN_KEY: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'ghf_refresh_token',
    USER_KEY: import.meta.env.VITE_AUTH_USER_KEY || 'ghf_user_data',
    LOGIN_REDIRECT: '/dashboard',
    LOGOUT_REDIRECT: '/login',
};

// Permission Constants
export const PERMISSIONS = {
    // Users
    USERS_READ: 'Users:read',
    USERS_CREATE: 'Users:create',
    USERS_UPDATE: 'Users:update',
    USERS_DELETE: 'Users:delete',

    // HR
    HR_READ: 'HR:read',
    HR_CREATE: 'HR:create',
    HR_UPDATE: 'HR:update',
    HR_DELETE: 'HR:delete',

    // Leaves
    LEAVES_READ: 'Leaves:read',
    LEAVES_CREATE: 'Leaves:create',
    LEAVES_UPDATE: 'Leaves:update',
    LEAVES_DELETE: 'Leaves:delete',

    // Documents
    DOCUMENTS_READ: 'Documents:read',
    DOCUMENTS_CREATE: 'Documents:create',
    DOCUMENTS_UPDATE: 'Documents:update',
    DOCUMENTS_DELETE: 'Documents:delete',

    // Settings
    SETTINGS_READ: 'Settings:read',
    SETTINGS_CREATE: 'Settings:create',
    SETTINGS_UPDATE: 'Settings:update',
    SETTINGS_DELETE: 'Settings:delete',

    // Finance
    FINANCE_READ: 'Finance:read',
    FINANCE_CREATE: 'Finance:create',
    FINANCE_UPDATE: 'Finance:update',
    FINANCE_DELETE: 'Finance:delete',

    // Reports
    REPORTS_READ: 'Reports:read',

    // Dashboard
    DASHBOARD_READ: 'Dashboard:read',
};

// Role Constants
export const ROLES = {
    ADMIN: 'Admin',
    HR_MANAGER: 'HR Manager',
    DEPARTMENT_HEAD: 'Department Head',
    EMPLOYEE: 'Employee',
    FINANCE_MANAGER: 'Finance Manager',
};

// Route Constants
export const ROUTES = {
    // Public routes
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',

    // Protected routes
    DASHBOARD: '/dashboard',

    // Employee routes
    EMPLOYEES: '/employees',
    EMPLOYEE_CREATE: '/employees/create',
    EMPLOYEE_DETAILS: '/employees/:id',
    EMPLOYEE_EDIT: '/employees/:id/edit',

    // Leave routes
    LEAVES: '/leaves',
    LEAVE_CREATE: '/leaves/create',
    LEAVE_DETAILS: '/leaves/:id',
    LEAVE_APPROVALS: '/leaves/approvals',

    // Attendance routes
    ATTENDANCE: '/attendance',
    ATTENDANCE_REPORTS: '/attendance/reports',
    ATTENDANCE_SCHEDULE: '/attendance/schedule',

    // Department routes
    DEPARTMENTS: '/departments',
    DEPARTMENT_CREATE: '/departments/create',
    DEPARTMENT_DETAILS: '/departments/:id',

    // Finance routes
    FINANCE: '/finance',
    BUDGETS: '/finance/budgets',
    ASSETS: '/finance/assets',
    REQUISITIONS: '/finance/requisitions',

    // Document routes
    DOCUMENTS: '/documents',

    // Report routes
    REPORTS: '/reports',

    // Settings routes
    SETTINGS: '/settings',
    ROLES_SETTINGS: '/settings/roles',
    MENUS_SETTINGS: '/settings/menus',
    USERS_SETTINGS: '/settings/users',

    // Profile routes
    PROFILE: '/profile',

    // Error routes
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
};

// Menu Icons (Material-UI icons)
export const MENU_ICONS = {
    DASHBOARD: 'DashboardOutlined',
    EMPLOYEES: 'PeopleOutlined',
    LEAVES: 'EventNoteOutlined',
    ATTENDANCE: 'AccessTimeOutlined',
    DEPARTMENTS: 'CorporateFareOutlined',
    FINANCE: 'AccountBalanceOutlined',
    DOCUMENTS: 'FolderOutlined',
    REPORTS: 'AssessmentOutlined',
    SETTINGS: 'SettingsOutlined',
    PROFILE: 'PersonOutlined',
    BUDGETS: 'AccountBalanceWalletOutlined',
    ASSETS: 'InventoryOutlined',
    REQUISITIONS: 'RequestQuoteOutlined',
    USERS: 'SupervisedUserCircleOutlined',
    ROLES: 'SecurityOutlined',
    MENUS: 'MenuOutlined',
};

// Leave Status Constants
export const LEAVE_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED_BY_SUPERVISOR: 'approved by supervisor',
    APPROVED_BY_HR: 'approved by hr',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

// Attendance Status Constants
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    ON_LEAVE: 'on leave',
    HALF_DAY: 'half day',
};

// File Upload Constants
export const FILE_UPLOAD = {
    MAX_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
    ALLOWED_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
        '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'
    ],
};

// Theme Constants
export const THEME_CONSTANTS = {
    DRAWER_WIDTH: 280,
    HEADER_HEIGHT: 64,
    BREAKPOINTS: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
    },
};

// Pagination Constants
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// Date Format Constants
export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    API: 'yyyy-MM-dd',
    DATETIME_DISPLAY: 'dd/MM/yyyy HH:mm',
    TIME_DISPLAY: 'HH:mm',
};

// Notification Types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  };