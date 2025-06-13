import { ROLES, PERMISSIONS } from '../constants';

export const hasRole = (userRoles, requiredRole) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;

    return userRoles.some(role =>
        typeof role === 'string'
            ? role === requiredRole
            : role.role_name === requiredRole
    );
};

export const hasAnyRole = (userRoles, requiredRoles) => {
    if (!userRoles || !Array.isArray(userRoles) || !requiredRoles) return false;

    return requiredRoles.some(role => hasRole(userRoles, role));
};

export const hasPermission = (userPermissions, requiredPermission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) return false;

    return userPermissions.some(permission =>
        typeof permission === 'string'
            ? permission === requiredPermission
            : permission.name === requiredPermission
    );
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
    if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions) return false;

    return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

export const isAdmin = (userRoles) => hasRole(userRoles, ROLES.ADMIN);

export const isHR = (userRoles) => hasAnyRole(userRoles, [ROLES.ADMIN, ROLES.HR_MANAGER]);

export const isManager = (userRoles) => hasAnyRole(userRoles, [
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.DEPARTMENT_HEAD
]);

export const canManageEmployees = (userRoles) => isHR(userRoles);

export const canApproveLeaves = (userRoles) => isManager(userRoles);

export const canViewReports = (userRoles) => isManager(userRoles);

export const canManageSettings = (userRoles) => isAdmin(userRoles);