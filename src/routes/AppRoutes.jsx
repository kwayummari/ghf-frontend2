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

// Page Components
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EmployeesPage from "../pages/employees/EmployeesPage";
import EmployeeDetailsPage from "../pages/employees/EmployeeDetailsPage";
import CreateEmployeePage from "../pages/employees/CreateEmployeePage";
import LeavesPage from "../pages/leaves/LeavesPage";
import LeaveDetailsPage from "../pages/leaves/LeaveDetailsPage";
import CreateLeavePage from "../pages/leaves/CreateLeavePage";
import LeaveApprovalsPage from "../pages/leaves/LeaveApprovalsPage";
import AttendancePage from "../pages/attendance/AttendancePage";
import AttendanceReportsPage from "../pages/attendance/AttendanceReportsPage";
import WorkSchedulePage from "../pages/attendance/WorkSchedulePage";
import DepartmentsPage from "../pages/departments/DepartmentsPage";
import DepartmentDetailsPage from "../pages/departments/DepartmentDetailsPage";
import FinancePage from "../pages/finance/FinancePage";
import BudgetsPage from "../pages/finance/BudgetsPage";
import AssetsPage from "../pages/finance/AssetsPage";
import RequisitionsPage from "../pages/finance/RequisitionsPage";
import DocumentsPage from "../pages/documents/DocumentsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import RolesPage from "../pages/settings/RolesPage";
import MenusPage from "../pages/settings/MenusPage";
import UsersPage from "../pages/settings/UsersPage";
import ProfilePage from "../pages/profile/ProfilePage";
import NotFoundPage from "../pages/error/NotFoundPage";
import UnauthorizedPage from "../pages/error/UnauthorizedPage";

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
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

        {/* Employee Management */}
        <Route
          path={ROUTES.EMPLOYEES}
          element={
            <AccessGuard
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.HR_MANAGER,
                ROLES.DEPARTMENT_HEAD,
              ]}
              requiredPermissions={[PERMISSIONS.HR_READ]}
            >
              <EmployeesPage />
            </AccessGuard>
          }
        />
        <Route
          path={ROUTES.EMPLOYEE_CREATE}
          element={
            <AccessGuard
              allowedRoles={[ROLES.ADMIN, ROLES.HR_MANAGER]}
              requiredPermissions={[PERMISSIONS.HR_CREATE]}
            >
              <CreateEmployeePage />
            </AccessGuard>
          }
        />
        <Route
          path={ROUTES.EMPLOYEE_DETAILS}
          element={
            <AccessGuard
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.HR_MANAGER,
                ROLES.DEPARTMENT_HEAD,
              ]}
              requiredPermissions={[PERMISSIONS.HR_READ]}
            >
              <EmployeeDetailsPage />
            </AccessGuard>
          }
        />
        <Route
          path={ROUTES.EMPLOYEE_EDIT}
          element={
            <AccessGuard
              allowedRoles={[ROLES.ADMIN, ROLES.HR_MANAGER]}
              requiredPermissions={[PERMISSIONS.HR_UPDATE]}
            >
              <EmployeeDetailsPage />
            </AccessGuard>
          }
        />

        {/* Leave Management */}
        <Route path={ROUTES.LEAVES} element={<LeavesPage />} />
        <Route
          path={ROUTES.LEAVE_CREATE}
          element={
            <AccessGuard requiredPermissions={[PERMISSIONS.LEAVES_CREATE]}>
              <CreateLeavePage />
            </AccessGuard>
          }
        />
        <Route path={ROUTES.LEAVE_DETAILS} element={<LeaveDetailsPage />} />
        <Route
          path={ROUTES.LEAVE_APPROVALS}
          element={
            <ManagerGuard>
              <LeaveApprovalsPage />
            </ManagerGuard>
          }
        />

        {/* Attendance Management */}
        <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
        <Route
          path={ROUTES.ATTENDANCE_REPORTS}
          element={
            <ManagerGuard>
              <AttendanceReportsPage />
            </ManagerGuard>
          }
        />
        <Route
          path={ROUTES.ATTENDANCE_SCHEDULE}
          element={
            <AdminGuard>
              <WorkSchedulePage />
            </AdminGuard>
          }
        />

        {/* Department Management */}
        <Route
          path={ROUTES.DEPARTMENTS}
          element={
            <ManagerGuard>
              <DepartmentsPage />
            </ManagerGuard>
          }
        />
        <Route
          path={ROUTES.DEPARTMENT_CREATE}
          element={
            <HRGuard>
              <DepartmentsPage />
            </HRGuard>
          }
        />
        <Route
          path={ROUTES.DEPARTMENT_DETAILS}
          element={
            <ManagerGuard>
              <DepartmentDetailsPage />
            </ManagerGuard>
          }
        />

        {/* Finance Management */}
        <Route
          path={ROUTES.FINANCE}
          element={
            <AccessGuard
              allowedRoles={[ROLES.ADMIN, ROLES.FINANCE_MANAGER]}
              requiredPermissions={[PERMISSIONS.FINANCE_READ]}
            >
              <FinancePage />
            </AccessGuard>
          }
        />
        <Route
          path={ROUTES.BUDGETS}
          element={
            <AccessGuard
              allowedRoles={[ROLES.ADMIN, ROLES.FINANCE_MANAGER]}
              requiredPermissions={[PERMISSIONS.FINANCE_READ]}
            >
              <BudgetsPage />
            </AccessGuard>
          }
        />
        <Route
          path={ROUTES.ASSETS}
          element={
            <AccessGuard
              allowedRoles={[ROLES.ADMIN, ROLES.FINANCE_MANAGER]}
              requiredPermissions={[PERMISSIONS.FINANCE_READ]}
            >
              <AssetsPage />
            </AccessGuard>
          }
        />
        <Route
          path={ROUTES.REQUISITIONS}
          element={
            <AccessGuard requiredPermissions={[PERMISSIONS.FINANCE_READ]}>
              <RequisitionsPage />
            </AccessGuard>
          }
        />

        {/* Document Management */}
        <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />

        {/* Reports */}
        <Route
          path={ROUTES.REPORTS}
          element={
            <AccessGuard
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.HR_MANAGER,
                ROLES.DEPARTMENT_HEAD,
              ]}
              requiredPermissions={[PERMISSIONS.REPORTS_READ]}
            >
              <ReportsPage />
            </AccessGuard>
          }
        />

        {/* Settings */}
        <Route
          path={ROUTES.SETTINGS}
          element={
            <AdminGuard>
              <SettingsPage />
            </AdminGuard>
          }
        />
        <Route
          path={ROUTES.ROLES_SETTINGS}
          element={
            <AdminGuard>
              <RolesPage />
            </AdminGuard>
          }
        />
        <Route
          path={ROUTES.MENUS_SETTINGS}
          element={
            <AdminGuard>
              <MenusPage />
            </AdminGuard>
          }
        />
        <Route
          path={ROUTES.USERS_SETTINGS}
          element={
            <HRGuard>
              <UsersPage />
            </HRGuard>
          }
        />

        {/* Profile */}
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

        {/* Error Pages */}
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
