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
    LEAVE_APPROVALS: '/leaves/approvals',
    MY_LEAVES: '/leaves/my',
    LEAVE_BALANCE: '/leaves/balance',
    LEAVE_BALANCE_BY_USER: (userId) => `/leaves/balance/${userId}`,
    LEAVE_CHECK_BALANCE: '/leaves/check-balance',

    LEAVE_BALANCE: '/leaves/balance',
    LEAVE_BALANCE_BY_USER: (userId) => `/leaves/balance/${userId}`,
    LEAVE_STATISTICS: '/leaves/statistics',
    LEAVE_CHECK_CONFLICTS: '/leaves/check-conflicts',
    LEAVE_BULK_ACTION: '/leaves/bulk-action',
    LEAVE_EXPORT: '/leaves/export',
    LEAVE_CANCEL: (id) => `/leaves/${id}/cancel`,
    LEAVE_DETAILS_READ: 'LeaveDetails:read',
    LEAVE_DETAILS_UPDATE: 'LeaveDetails:update',

    // Attendance
    ATTENDANCE: '/attendance',
    ATTENDANCE_CLOCK_IN: '/attendance/clock-in',
    ATTENDANCE_CLOCK_OUT: '/attendance/clock-out',
    ATTENDANCE_MY: '/attendance/my-attendance',
    ATTENDANCE_EMPLOYEE: (id) => `/attendance/employees/${id}`,
    ATTENDANCE_DEPARTMENT_REPORT: (id) => `/attendance/departments/${id}/report`,
    ATTENDANCE_HOLIDAYS: '/attendance/holidays',
    ATTENDANCE_WORK_SCHEDULE: '/attendance/work-schedule',

    // NEW: Attendance-based Timesheet Management
    ATTENDANCE_TIMESHEET_SUBMIT: '/attendance/timesheet/submit',
    ATTENDANCE_TIMESHEET_TEAM: '/attendance/timesheet/team',
    ATTENDANCE_TIMESHEET_APPROVE: '/attendance/timesheet/approve',
    ATTENDANCE_TIMESHEET_REJECT: '/attendance/timesheet/reject',
    ATTENDANCE_TIMESHEET_PAYROLL: '/attendance/timesheet/payroll',

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
    MENU_PERMISSION_MATRIX: '/menus/permission-matrix',
    MENU_ORDER_UPDATE: (id) => `/menus/${id}/order`,
    MENU_BULK_PERMISSIONS: '/menus/bulk-permissions',
    MENU_ROLE_PERMISSIONS: (menuId) => `/menus/${menuId}/role-permissions`,

    // **NEW ENDPOINTS - Payroll Management**
    PAYROLL: '/payroll',
    PAYROLL_BY_ID: (id) => `/payroll/${id}`,
    PAYROLL_PROCESS: '/payroll/process',
    PAYROLL_APPROVE: (id) => `/payroll/${id}/approve`,
    PAYROLL_EMPLOYEE: (userId) => `/payroll/employee/${userId}`,
    PAYROLL_PERIOD: (year, month) => `/payroll/period/${year}/${month}`,
    SALARY_COMPONENTS: '/payroll/salary-components',
    SALARY_COMPONENT_BY_USER: (userId) => `/payroll/salary-components/user/${userId}`,
    PAYROLL_REPORTS: '/payroll/reports',
    PAYSLIPS: '/payroll/payslips',
    PAYSLIP_BY_ID: (id) => `/payroll/payslips/${id}`,
    PAYROLL_GENERATE: 'Payroll:generate',

    // **NEW ENDPOINTS - Performance Management**
    PERFORMANCE: '/performance',
    APPRAISALS: '/performance/appraisals',
    APPRAISAL_BY_ID: (id) => `/performance/appraisals/${id}`,
    OBJECTIVES: '/performance/objectives',
    OBJECTIVE_BY_ID: (id) => `/performance/objectives/${id}`,
    OBJECTIVES_BY_USER: (userId) => `/performance/objectives/user/${userId}`,
    OBJECTIVES_BY_FISCAL_YEAR: (fiscalYearId) => `/performance/objectives/fiscal-year/${fiscalYearId}`,

    // **NEW ENDPOINTS - Meeting Management**
    MEETINGS: '/meetings',
    MEETING_BY_ID: (meetingId) => `/meetings/${meetingId}`,
    MEETING_STATUS: (meetingId) => `/meetings/${meetingId}/status`,

    // Meeting Attendees
    MEETING_ATTENDEES: (meetingId) => `/meetings/${meetingId}/attendees`,
    MEETING_ATTENDEE_STATUS: (meetingId, attendeeId) => `/meetings/${meetingId}/attendees/${attendeeId}/status`,

    // Meeting Tasks
    ALL_MEETING_TASKS: '/meetings/tasks',
    MEETING_TASKS: (meetingId) => `/meetings/${meetingId}/tasks`,
    MEETING_TASK_BY_ID: (taskId) => `/meetings/tasks/${taskId}`,
    MEETING_TASK_PROGRESS: (taskId) => `/meetings/tasks/${taskId}/progress`,

    // Meeting Documents & Minutes
    MEETING_DOCUMENTS: (meetingId) => `/meetings/${meetingId}/documents`,
    MEETING_MINUTES: (meetingId) => `/meetings/${meetingId}/minutes`,
    MEETING_NOTIFICATIONS: (meetingId) => `/meetings/${meetingId}/notifications`,

    // Meeting Reports & Statistics
    MEETING_REPORTS: '/meetings/reports',
    MEETING_STATISTICS: '/meetings/statistics',
    USER_MEETINGS: '/meetings/user',

    // Meeting Actions (these might use the same endpoints as status updates)
    START_MEETING: (meetingId) => `/meetings/${meetingId}/start`,
    END_MEETING: (meetingId) => `/meetings/${meetingId}/end`,
    CANCEL_MEETING: (meetingId) => `/meetings/${meetingId}/cancel`,

    // **NEW ENDPOINTS - Travel & Advances**
    TRAVEL_REQUESTS: '/travel/requests',
    TRAVEL_REQUEST_BY_ID: (id) => `/travel/requests/${id}`,
    TRAVEL_ADVANCES: '/travel/advances',
    TRAVEL_ADVANCE_BY_ID: (id) => `/travel/advances/${id}`,
    EXPENSE_REPORTS: '/travel/expense-reports',
    EXPENSE_REPORT_BY_ID: (id) => `/travel/expense-reports/${id}`,
    FLAT_RATES: '/travel/flat-rates',
    TRAVEL_APPROVE: (id) => `/travel/requests/${id}/approve`,
    TRAVEL_RETIRE: (id) => `/travel/advances/${id}/retire`,

    // **NEW ENDPOINTS - Petty Cash Management**
    PETTY_CASH: '/petty-cash',
    PETTY_CASH_BOOK: '/petty-cash/book',
    PETTY_CASH_BOOK_BY_ID: (id) => `/petty-cash/book/${id}`,
    PETTY_CASH_EXPENSES: '/petty-cash/expenses',
    PETTY_CASH_EXPENSE_BY_ID: (id) => `/petty-cash/expenses/${id}`,
    REPLENISHMENT_REQUESTS: '/petty-cash/replenishment',
    REPLENISHMENT_REQUEST_BY_ID: (id) => `/petty-cash/replenishment/${id}`,
    REPLENISHMENT_APPROVE: (id) => `/petty-cash/replenishment/${id}/approve`,

    // **NEW ENDPOINTS - Procurement & Suppliers**
    SUPPLIERS: '/procurement/suppliers',
    SUPPLIER_BY_ID: (id) => `/procurement/suppliers/${id}`,
    QUOTATIONS: '/procurement/quotations',
    QUOTATION_BY_ID: (id) => `/procurement/quotations/${id}`,
    PURCHASE_ORDERS: '/procurement/purchase-orders',
    PURCHASE_ORDER_BY_ID: (id) => `/procurement/purchase-orders/${id}`,
    PURCHASE_REQUESTS: '/procurement/requests',
    PURCHASE_REQUEST_BY_ID: (id) => `/procurement/requests/${id}`,
    QUOTATION_COMPARE: '/procurement/quotations/compare',
    PURCHASE_REQUEST_APPROVE: (id) => `/procurement/requests/${id}/approve`,
    GENERATE_LPO: (id) => `/procurement/purchase-orders/${id}/lpo`,

    // **NEW ENDPOINTS - Enhanced Budget Management**
    BUDGETS: '/finance/budgets',
    BUDGET_BY_ID: (id) => `/finance/budgets/${id}`,
    BUDGET_PLANNING: '/finance/budgets/planning',
    BUDGET_MONITORING: '/finance/budgets/monitoring',
    BUDGET_VARIANCE: '/finance/budgets/variance',
    BUDGET_ALLOCATION: '/finance/budgets/allocation',
    BUDGET_EXPENSES: '/finance/budgets/expenses',
    BUDGET_EXPENSE_BY_ID: (id) => `/finance/budgets/expenses/${id}`,
    FISCAL_YEARS: '/finance/fiscal-years',
    QUARTERS: '/finance/quarters',

    // **NEW ENDPOINTS - Enhanced Asset Management**
    ASSETS: '/finance/assets',
    ASSET_BY_ID: (id) => `/finance/assets/${id}`,
    ASSET_REGISTER: '/finance/assets/register',
    ASSET_DEPRECIATION: '/finance/assets/depreciation',
    ASSET_MAINTENANCE: '/finance/assets/maintenance',
    ASSET_MAINTENANCE_BY_ID: (id) => `/finance/assets/maintenance/${id}`,
    ASSET_DISPOSAL: (id) => `/finance/assets/${id}/dispose`,

    // **Enhanced Reports**
    REPORTS: '/reports',
    REPORTS_HR: '/reports/hr',
    REPORTS_FINANCE: '/reports/finance',
    REPORTS_PAYROLL: '/reports/payroll',
    REPORTS_ATTENDANCE: '/reports/attendance',
    REPORTS_PROCUREMENT: '/reports/procurement',
    REPORTS_BUDGET: '/reports/budget',
    REPORTS_ASSETS: '/reports/assets',

    // **System Settings**
    SETTINGS: '/settings',
    LEAVE_TYPE_SETTINGS: '/settings/leave-types',
    HOLIDAY_SETTINGS: '/settings/holidays',
    SALARY_SCALE_SETTINGS: '/settings/salary-scale',
    SYSTEM_LOGS: '/settings/logs',
    SYSTEM_BACKUP: '/settings/backup',
    EMAIL_TEMPLATES: '/settings/email-templates',
    NOTIFICATION_SETTINGS: '/settings/notifications',

    SYSTEM_LOGS: '/settings/logs',
    SYSTEM_LOGS_STATS: '/settings/logs/stats',
    SYSTEM_LOGS_RECENT: '/settings/logs/recent',
    SYSTEM_LOGS_EXPORT: '/settings/logs/export',
    SYSTEM_LOGS_SECURITY: '/settings/logs/security',
    SYSTEM_LOGS_AUDIT_TRAIL: '/settings/logs/audit-trail',
    SYSTEM_LOGS_USER_ACTION: '/settings/logs/user-action',
    AUDIT_LOGS: '/audit/logs',

    // Timesheet Management
    TIMESHEETS: '/timesheets',
    TIMESHEET_BY_ID: (id) => `/timesheets/${id}`,
    TIMESHEET_SUBMIT: (id) => `/timesheets/${id}/submit`,
    TIMESHEET_APPROVE: (id) => `/timesheets/${id}/approve`,
    TIMESHEET_REJECT: (id) => `/timesheets/${id}/reject`,
    TEAM_TIMESHEETS: '/timesheets/team',
    TIMESHEET_SUMMARY: '/timesheets/summary',
    TIMESHEET_EXPORT: '/timesheets/export',
    MY_TIMESHEETS: '/timesheets/my',
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

    MENUS_READ: 'Menus:read',
    MENUS_CREATE: 'Menus:create',
    MENUS_UPDATE: 'Menus:update',
    MENUS_DELETE: 'Menus:delete',
    MANAGE_MENUS: 'Menus:manage',
    MENU_PERMISSIONS: 'Menus:permissions',

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

    VIEW_PETTY_CASH: 'View Petty Cash',
    CREATE_PETTY_CASH_ENTRY: 'Create Petty Cash Entry',
    UPDATE_PETTY_CASH: 'Update Petty Cash',
    DELETE_PETTY_CASH_ENTRY: 'Delete Petty Cash Entry',
    REQUEST_REPLENISHMENT: 'Request Replenishment',
    APPROVE_REPLENISHMENT: 'Approve Replenishment',
    VIEW_PETTY_CASH_REPORTS: 'View Petty Cash Reports',
    MANAGE_PETTY_CASH_BOOK: 'Manage Petty Cash Book',

    // Reports
    REPORTS_READ: 'Reports:read',

    // Dashboard
    DASHBOARD_READ: 'Dashboard:read',

    VIEW_MEETINGS: 'view_meetings',
    CREATE_MEETINGS: 'create_meetings',
    UPDATE_MEETINGS: 'update_meetings',
    DELETE_MEETINGS: 'delete_meetings',
    MANAGE_MEETING_ATTENDEES: 'manage_meeting_attendees',
    UPLOAD_MEETING_MINUTES: 'upload_meeting_minutes',
    CREATE_MEETING_TASKS: 'create_meeting_tasks',
    UPDATE_TASK_STATUS: 'update_task_status',
    VIEW_MEETING_REPORTS: 'view_meeting_reports',
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
    TIMESHEET: '/attendance/timesheet',
    TIMESHEET_APPROVAL: '/attendance/timesheet/approval',
    PAYROLL_PROCESSING: '/finance/payroll/processing',

    // Attendance routes
    ATTENDANCE: '/attendance',
    ATTENDANCE_REPORTS: '/attendance/reports',
    ATTENDANCE_SCHEDULE: '/attendance/schedule',

    // Timesheet Management
    TIMESHEET_READ: 'Timesheet:read',
    TIMESHEET_CREATE: 'Timesheet:create',
    TIMESHEET_UPDATE: 'Timesheet:update',
    TIMESHEET_APPROVE: 'Timesheet:approve',
    TIMESHEET_REJECT: 'Timesheet:reject',

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

    SETTINGS_AUDIT: '/settings/audit',
    SETTINGS_BACKUP: '/settings/backup',
    SETTINGS_COMPANY: '/settings/company',
    SETTINGS_EMAIL: '/settings/email',
    SETTINGS_NOTIFICATIONS: '/settings/notifications',
    SETTINGS_SECURITY: '/settings/security',
    SETTINGS_INTEGRATIONS: '/settings/integrations',

    // **ACTIVITY LOGS ROUTES**
    ACTIVITY_LOGS: '/settings/audit',
    AUDIT_TRAIL: '/audit/trail',
    SECURITY_LOGS: '/security/logs',

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
  
export const MEETING_PERMISSIONS = {
    VIEW_MEETINGS: 'view_meetings',
    CREATE_MEETINGS: 'create_meetings',
    UPDATE_MEETINGS: 'update_meetings',
    DELETE_MEETINGS: 'delete_meetings',
    MANAGE_MEETING_ATTENDEES: 'manage_meeting_attendees',
    UPLOAD_MEETING_MINUTES: 'upload_meeting_minutes',
    CREATE_MEETING_TASKS: 'create_meeting_tasks',
    UPDATE_TASK_STATUS: 'update_task_status',
    VIEW_MEETING_REPORTS: 'view_meeting_reports',
};