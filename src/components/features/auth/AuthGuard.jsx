import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import {
  selectIsAuthenticated,
  selectUser,
  selectProfileLoading,
  getUserProfile,
  getUserMenus,
} from "../../../store/slices/authSlice";
import { ROUTES, ROLES, PERMISSIONS } from "../../../constants";
import authService from "../../../services/auth/authService";

// Loading component
const AuthLoading = () => (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

// Basic AuthGuard for authentication check only
export const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const profileLoading = useSelector(selectProfileLoading);
  const location = useLocation();

  useEffect(() => {
    // If authenticated but no user data, fetch profile
    if (isAuthenticated && !user) {
      dispatch(getUserProfile());
      dispatch(getUserMenus());
    }
  }, [dispatch, isAuthenticated, user]);

  // Show loading while checking authentication
  if (profileLoading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

// Role-based guard
export const RoleGuard = ({
  children,
  allowedRoles = [],
  requireAll = false,
}) => {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const hasRequiredRole = requireAll
    ? allowedRoles.every((role) => authService.hasRole(role))
    : allowedRoles.some((role) => authService.hasRole(role));

  if (!hasRequiredRole) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

// Permission-based guard
export const PermissionGuard = ({
  children,
  requiredPermissions = [],
  requireAll = false,
}) => {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const hasRequiredPermission = requireAll
    ? requiredPermissions.every((permission) =>
        authService.hasPermission(permission)
      )
    : requiredPermissions.some((permission) =>
        authService.hasPermission(permission)
      );

  if (!hasRequiredPermission) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

// Combined guard for both roles and permissions
export const AccessGuard = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = false,
  fallbackPath = ROUTES.UNAUTHORIZED,
}) => {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check roles if provided
  let hasRoleAccess = true;
  if (allowedRoles.length > 0) {
    hasRoleAccess = requireAllRoles
      ? allowedRoles.every((role) => authService.hasRole(role))
      : allowedRoles.some((role) => authService.hasRole(role));
  }

  // Check permissions if provided
  let hasPermissionAccess = true;
  if (requiredPermissions.length > 0) {
    hasPermissionAccess = requireAllPermissions
      ? requiredPermissions.every((permission) =>
          authService.hasPermission(permission)
        )
      : requiredPermissions.some((permission) =>
          authService.hasPermission(permission)
        );
  }

  // Grant access if user has either role or permission access
  const hasAccess = hasRoleAccess || hasPermissionAccess;

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

// Admin only guard
export const AdminGuard = ({ children }) => (
  <RoleGuard allowedRoles={[ROLES.ADMIN]}>{children}</RoleGuard>
);

// HR Manager or Admin guard
export const HRGuard = ({ children }) => (
  <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.HR_MANAGER]}>
    {children}
  </RoleGuard>
);

// Department Head, HR Manager, or Admin guard
export const ManagerGuard = ({ children }) => (
  <RoleGuard
    allowedRoles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_HEAD]}
  >
    {children}
  </RoleGuard>
);

// Higher-order component for protecting routes
export const withAuth = (Component, guardConfig = {}) => {
  return (props) => {
    const {
      requireAuth = true,
      allowedRoles = [],
      requiredPermissions = [],
      requireAllRoles = false,
      requireAllPermissions = false,
      fallbackPath = ROUTES.UNAUTHORIZED,
    } = guardConfig;

    if (!requireAuth) {
      return <Component {...props} />;
    }

    return (
      <AuthGuard>
        <AccessGuard
          allowedRoles={allowedRoles}
          requiredPermissions={requiredPermissions}
          requireAllRoles={requireAllRoles}
          requireAllPermissions={requireAllPermissions}
          fallbackPath={fallbackPath}
        >
          <Component {...props} />
        </AccessGuard>
      </AuthGuard>
    );
  };
};

// Hook for checking access in components
export const useAuth = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    hasRole: (role) => authService.hasRole(role),
    hasAnyRole: (roles) => authService.hasAnyRole(roles),
    hasPermission: (permission) => authService.hasPermission(permission),
    hasAnyPermission: (permissions) =>
      authService.hasAnyPermission(permissions),
    isAdmin: () => authService.hasRole(ROLES.ADMIN),
    isHR: () => authService.hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]),
    isManager: () =>
      authService.hasAnyRole([
        ROLES.ADMIN,
        ROLES.HR_MANAGER,
        ROLES.DEPARTMENT_HEAD,
      ]),
  };
};

export default AuthGuard;
