import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { ROUTES, ROLES, PERMISSIONS } from "../constants";

// Layout Components
import AppLayout from "../components/common/Layout/AppLayout";
import AuthGuard, {
  RoleGuard,
  PermissionGuard,
  AccessGuard,
  AdminGuard,
  HRGuard,
  ManagerGuard,
} from "../components/features/auth/AuthGuard";

// Existing Page Components
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EmployeesPage from "../pages/employees/EmployeesPage";
import EmployeeDetailsPage from "../pages/employees/EmployeeDetailsPage";
import CreateEmployeePage from "../pages/employees/CreateEmployeePage";
import LeavesPage from "../pages/leaves/LeavesPage";
import LeaveDetailsPage from "../pages/leaves/LeaveDetailsPage";
import LeaveEditPage from "../pages/leaves/LeaveEditPage";
import CreateLeavePage from "../pages/leaves/CreateLeavePage";
import LeaveApprovalsPage from "../pages/leaves/LeaveApprovalsPage";
import AttendancePage from "../pages/attendance/AttendancePage";
import AttendanceReportsPage from "../pages/attendance/AttendanceReportsPage";
import WorkSchedulePage from "../pages/attendance/WorkSchedulePage";
import TimesheetPage from "../pages/attendance/TimesheetPage";
import TimesheetApprovalPage from "../pages/attendance/TimesheetApprovalPage";
import DepartmentsPage from "../pages/departments/DepartmentsPage";
import DepartmentDetailsPage from "../pages/departments/DepartmentDetailsPage";
import FinancePage from "../pages/finance/FinancePage";
import BudgetsPage from "../pages/finance/BudgetsPage";
import AssetsPage from "../pages/finance/AssetsPage";
import RequisitionsPage from "../pages/finance/RequisitionsPage";
import DocumentsPage from "../pages/documents/DocumentsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import RoleManagementPage from "../pages/settings/RoleManagementPage";
import MenusPage from "../pages/settings/MenusPage";
import UsersPage from "../pages/settings/UsersPage";
import ProfilePage from "../pages/profile/ProfilePage";
import NotFoundPage from "../pages/error/NotFoundPage";
import UnauthorizedPage from "../pages/error/UnauthorizedPage";

// **NEW PAGE COMPONENTS**
// Payroll Management
import PayrollPage from "../pages/finance/PayrollPage";
import PayrollDetailsPage from "../pages/finance/PayrollDetailsPage";
// import PayrollProcessPage from "../pages/finance/PayrollProcessPage";
import PayrollProcessPage from "../pages/finance/PayrollProcessing";
import SalaryComponentsPage from "../pages/finance/SalaryComponentsPage";

// Asset Management
import AssetRegisterPage from "../pages/finance/AssetRegisterPage";
import AssetDetailsPage from "../pages/finance/AssetDetailsPage";
import AssetMaintenancePage from "../pages/finance/AssetMaintenancePage";
import AssetDepreciationPage from "../pages/finance/AssetDepreciationPage";

// Budget Management
import BudgetPlanningPage from "../pages/finance/BudgetPlanningPage";
import BudgetMonitoringPage from "../pages/finance/BudgetMonitoringPage";
import BudgetVariancePage from "../pages/finance/BudgetVariancePage";

// Travel & Advances
import TravelRequestsPage from "../pages/finance/TravelRequestsPage";
import TravelAdvancesPage from "../pages/finance/TravelAdvancesPage";
import ExpenseReportsPage from "../pages/finance/ExpenseReportsPage";

// Petty Cash Management
import PettyCashPage from "../pages/finance/PettyCashPage";
import PettyCashExpensesPage from "../pages/finance/PettyCashExpensesPage";
import ReplenishmentPage from "../pages/finance/ReplenishmentPage";

// Procurement
import SuppliersPage from "../pages/procurement/SuppliersPage";
import SupplierDetailsPage from "../pages/procurement/SupplierDetailsPage";
import QuotationsPage from "../pages/procurement/QuotationsPage";
// import PurchaseOrdersPage from "../pages/procurement/PurchaseOrdersPage";
// import PurchaseRequestsPage from "../pages/procurement/PurchaseRequestsPage";

// Performance Management
import PerformanceAppraisalsPage from "../pages/procurement/PerformanceAppraisalsPage";
// import ObjectivesPage from "../pages/performance/ObjectivesPage";

// Meeting Management
import MeetingsPage from "../pages/meetings/MeetingsPage";
import MeetingDetailsPage from "../pages/meetings/MeetingDetailsPage";
import MeetingTasksPage from "../pages/meetings/MeetingTasksPage";
import MeetingCreatePage from "../pages/meetings/MeetingCreatePage";

// Enhanced Reports
// import HRReportsPage from "../pages/reports/HRReportsPage";
// import FinanceReportsPage from "../pages/reports/FinanceReportsPage";
// import PayrollReportsPage from "../pages/reports/PayrollReportsPage";
// import AttendanceReportsEnhancedPage from "../pages/reports/AttendanceReportsPage";
// import ProcurementReportsPage from "../pages/reports/ProcurementReportsPage";

// Enhanced Settings
import FiscalYearSettingsPage from "../pages/settings/FiscalYearSettingsPage";
import SalaryScaleSettingsPage from "../pages/settings/SalaryScaleSettingsPage";
import LeaveTypeSettingsPage from "../pages/settings/LeaveTypeSettingsPage";
import HolidaySettingsPage from "../pages/settings/HolidaySettingsPage";
import SupervisorTimesheetApproval from "../components/features/attendance/SupervisorTimesheetApproval";
import ActivityLogsPage from "../pages/settings/ActivityLogsPage";

const AppRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <ForgotPasswordPage />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        {/* Employees Management */}
        <Route
          path="employees"
          element={
            <PermissionGuard permissions={[PERMISSIONS.USERS_READ]}>
              <EmployeesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="employees/create"
          element={
            <PermissionGuard permissions={[PERMISSIONS.USERS_CREATE]}>
              <CreateEmployeePage />
            </PermissionGuard>
          }
        />
        <Route
          path="employees/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.USERS_READ]}>
              <EmployeeDetailsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="employees/:id/edit"
          element={
            <PermissionGuard permissions={[PERMISSIONS.USERS_UPDATE]}>
              <EmployeeDetailsPage />
            </PermissionGuard>
          }
        />
        {/* Leave Management */}
        <Route
          path="leaves"
          element={
            <PermissionGuard permissions={[PERMISSIONS.LEAVES_READ]}>
              <LeavesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="leaves/create"
          element={
            <PermissionGuard permissions={[PERMISSIONS.LEAVES_CREATE]}>
              <CreateLeavePage />
            </PermissionGuard>
          }
        />
        <Route
          path="leaves/approvals"
          element={
            <PermissionGuard permissions={[PERMISSIONS.LEAVES_UPDATE]}>
              <LeaveApprovalsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="leaves/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.LEAVES_READ]}>
              <LeaveDetailsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="leaves/:id/edit"
          element={
            <PermissionGuard permissions={[PERMISSIONS.LEAVES_UPDATE]}>
              <LeaveEditPage />
            </PermissionGuard>
          }
        />
        {/* Attendance Management */}
        <Route
          path="attendance"
          element={
            <PermissionGuard permissions={[PERMISSIONS.HR_READ]}>
              <AttendancePage />
            </PermissionGuard>
          }
        />
        <Route
          path="attendance/reports"
          element={
            <PermissionGuard permissions={[PERMISSIONS.HR_READ]}>
              <AttendanceReportsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="attendance/schedule"
          element={
            <PermissionGuard permissions={[PERMISSIONS.HR_UPDATE]}>
              <WorkSchedulePage />
            </PermissionGuard>
          }
        />
        <Route
          path="attendance/timesheet"
          element={
            <PermissionGuard permissions={[PERMISSIONS.HR_READ]}>
              <TimesheetPage />
            </PermissionGuard>
          }
        />
        <Route
          path="attendance/timesheet/approval"
          element={
            <PermissionGuard permissions={[PERMISSIONS.HR_UPDATE]}>
              <TimesheetApprovalPage />
            </PermissionGuard>
          }
        />
        {/* Departments */}
        <Route
          path="departments"
          element={
            <PermissionGuard permissions={[PERMISSIONS.USERS_READ]}>
              <DepartmentsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="departments/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.USERS_READ]}>
              <DepartmentDetailsPage />
            </PermissionGuard>
          }
        />
        {/* **FINANCE ROUTES** */}
        <Route
          path="finance"
          element={
            <PermissionGuard permissions={[PERMISSIONS.FINANCE_READ]}>
              <FinancePage />
            </PermissionGuard>
          }
        />
        {/* Payroll Management */}
        <Route
          path="finance/payroll"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_PAYROLL]}>
              <PayrollPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/payroll/process"
          element={
            <PermissionGuard permissions={[PERMISSIONS.PROCESS_PAYROLL]}>
              <PayrollProcessPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/payroll/processing"
          element={
            <PermissionGuard permissions={[PERMISSIONS.PROCESS_PAYROLL]}>
              <PayrollProcessPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/payroll/history"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_PAYROLL_HISTORY]}>
              <PayrollPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/payroll/components"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.VIEW_SALARY_COMPONENTS]}
            ></PermissionGuard>
          }
        />
        <Route
          path="finance/payroll/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_PAYROLL]}>
              <PayrollDetailsPage />
            </PermissionGuard>
          }
        />
        {/* Budget Management */}
        <Route
          path="finance/budgets"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_BUDGET]}>
              <BudgetsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/budgets/planning"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_BUDGET_PLANNING]}>
              <BudgetPlanningPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/budgets/monitoring"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.MONITOR_BUDGET_PERFORMANCE]}
            >
              <BudgetMonitoringPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/budgets/variance"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_BUDGET_VARIANCE]}>
              <BudgetVariancePage />
            </PermissionGuard>
          }
        />
        {/* Asset Management */}
        <Route
          path="finance/assets"
          element={
            <PermissionGuard permissions={[PERMISSIONS.FINANCE_READ]}>
              <AssetsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/assets/register"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_ASSET_REGISTER]}>
              <AssetRegisterPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/assets/depreciation"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.VIEW_ASSET_DEPRECIATION]}
            >
              <AssetDepreciationPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/assets/maintenance"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_ASSET_MAINTENANCE]}>
              <AssetMaintenancePage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/assets/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_ASSET_REGISTER]}>
              <AssetDetailsPage />
            </PermissionGuard>
          }
        />
        {/* Travel & Advances */}
        <Route
          path="finance/travel/requests"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_TRAVEL_REQUESTS]}>
              <TravelRequestsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/travel/advances"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_TRAVEL_ADVANCES]}>
              <TravelAdvancesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/travel/expenses"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_EXPENSE_REPORTS]}>
              <ExpenseReportsPage />
            </PermissionGuard>
          }
        />
        {/* Petty Cash Management */}
        <Route
          path="finance/petty-cash"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_PETTY_CASH]}>
              <PettyCashPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/petty-cash/expenses"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.CREATE_PETTY_CASH_ENTRY]}
            >
              <PettyCashExpensesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/petty-cash/replenishment"
          element={
            <PermissionGuard permissions={[PERMISSIONS.REQUEST_REPLENISHMENT]}>
              <ReplenishmentPage />
            </PermissionGuard>
          }
        />
        <Route
          path="finance/requisitions"
          element={
            <PermissionGuard permissions={[PERMISSIONS.FINANCE_READ]}>
              <RequisitionsPage />
            </PermissionGuard>
          }
        />
        {/* **PROCUREMENT ROUTES** */}
        <Route
          path="procurement/suppliers"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_SUPPLIERS]}>
              <SuppliersPage />
            </PermissionGuard>
          }
        />
        <Route
          path="procurement/suppliers/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_SUPPLIERS]}>
              <SupplierDetailsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="procurement/quotations"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_QUOTATIONS]}>
              <QuotationsPage />
            </PermissionGuard>
          }
        />
        {/* <Route
          path="procurement/orders"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_PURCHASE_ORDERS]}>
              <PurchaseOrdersPage />
            </PermissionGuard>
          }
        />
        <Route
          path="procurement/requests"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_PURCHASE_REQUESTS]}>
              <PurchaseRequestsPage />
            </PermissionGuard>
          }
        /> */}
        {/* **PERFORMANCE MANAGEMENT ROUTES** */}
        <Route
          path="performance/appraisals"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.VIEW_PERFORMANCE_APPRAISALS]}
            >
              <PerformanceAppraisalsPage />
            </PermissionGuard>
          }
        />
        {/* <Route
          path="performance/objectives"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_OBJECTIVES]}>
              <ObjectivesPage />
            </PermissionGuard>
          }
        /> */}
        {/* **MEETING MANAGEMENT ROUTES** */}
        {/* **MEETING MANAGEMENT ROUTES** */}
        <Route
          path="meetings"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_MEETINGS]}>
              <MeetingsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="meetings/create"
          element={
            <PermissionGuard permissions={[PERMISSIONS.CREATE_MEETINGS]}>
              <MeetingCreatePage />
            </PermissionGuard>
          }
        />
        {/* All meeting tasks route - should come before specific meeting routes */}
        <Route
          path="meetings/tasks"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_MEETING_TASKS]}>
              <MeetingTasksPage />
            </PermissionGuard>
          }
        />
        {/* Specific meeting tasks route */}
        <Route
          path="meetings/:id/tasks"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_MEETING_TASKS]}>
              <MeetingTasksPage />
            </PermissionGuard>
          }
        />
        <Route
          path="meetings/:id"
          element={
            <PermissionGuard permissions={[PERMISSIONS.VIEW_MEETINGS]}>
              <MeetingDetailsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="meetings/:id/edit"
          element={
            <PermissionGuard permissions={[PERMISSIONS.UPDATE_MEETINGS]}>
              <MeetingDetailsPage />
            </PermissionGuard>
          }
        />

        {/* Documents */}
        <Route
          path="documents"
          element={
            <PermissionGuard permissions={[PERMISSIONS.DOCUMENTS_READ]}>
              <DocumentsPage />
            </PermissionGuard>
          }
        />
        {/* **ENHANCED REPORTS ROUTES** */}
        <Route
          path="reports"
          element={
            <PermissionGuard permissions={[PERMISSIONS.REPORTS_READ]}>
              <ReportsPage />
            </PermissionGuard>
          }
        />
        {/* <Route
          path="reports/hr"
          element={
            <PermissionGuard permissions={[PERMISSIONS.REPORTS_READ]}>
              <HRReportsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="reports/finance"
          element={
            <PermissionGuard permissions={[PERMISSIONS.REPORTS_READ]}>
              <FinanceReportsPage />
            </PermissionGuard>
          }
        /> */}
        {/* <Route
          path="reports/payroll"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.GENERATE_PAYROLL_REPORTS]}
            >
              <PayrollReportsPage />
            </PermissionGuard>
          }
        /> */}
        {/* <Route
          path="reports/attendance"
          element={
            <PermissionGuard permissions={[PERMISSIONS.REPORTS_READ]}>
              <AttendanceReportsEnhancedPage />
            </PermissionGuard>
          }
        /> */}
        {/* <Route
          path="reports/procurement"
          element={
            <PermissionGuard
              permissions={[PERMISSIONS.VIEW_PROCUREMENT_REPORTS]}
            >
              <ProcurementReportsPage />
            </PermissionGuard>
          }
        /> */}
        {/* Settings */}
        <Route
          path="settings"
          element={
            <PermissionGuard permissions={[PERMISSIONS.SETTINGS_READ]}>
              <SettingsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="settings/roles"
          element={
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_ROLES]}>
              <RoleManagementPage />
            </PermissionGuard>
          }
        />
        <Route
          path="settings/menus"
          element={
            <AdminGuard>
              <MenusPage />
            </AdminGuard>
          }
        />
        <Route
          path="settings/users"
          element={
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_USERS]}>
              <UsersPage />
            </PermissionGuard>
          }
        />
        {/* **ENHANCED SETTINGS ROUTES** */}
        <Route
          path="settings/fiscal-year"
          element={
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_FISCAL_YEAR]}>
              <FiscalYearSettingsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="settings/salary-scale"
          element={
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_SALARY_SCALE]}>
              <SalaryScaleSettingsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="settings/leave-types"
          element={
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_LEAVE_TYPES]}>
              <LeaveTypeSettingsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="settings/holidays"
          element={
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_HOLIDAYS]}>
              <HolidaySettingsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="/attendance/timesheet/approval"
          element={
            <PermissionGuard permissions={[PERMISSIONS.TIMESHEET_APPROVE]}>
              <SupervisorTimesheetApproval />
            </PermissionGuard>
          }
        />
        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
        {/* Error Pages */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback for unauthenticated users */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

      <Route
        path="settings/audit"
        element={
          <PermissionGuard permissions={["VIEW_AUDIT_LOGS"]}>
            <ActivityLogsPage />
          </PermissionGuard>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
