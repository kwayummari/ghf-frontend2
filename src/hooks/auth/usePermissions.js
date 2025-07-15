// src/hooks/usePermissions.js
// Create this file if it doesn't exist

import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Adjust path as needed

export const usePermissions = () => {
    const { user } = useContext(AuthContext) || { user: null };

    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;

        // Check if user has the specific permission
        return user.permissions.some(p =>
            typeof p === 'string' ? p === permission : p.name === permission
        );
    };

    const hasRole = (role) => {
        if (!user || !user.roles) return false;

        // Check if user has the specific role
        return user.roles.some(r =>
            typeof r === 'string' ? r === role : r.role_name === role
        );
    };

    const hasAnyPermission = (permissions) => {
        if (!permissions || !Array.isArray(permissions)) return false;
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAnyRole = (roles) => {
        if (!roles || !Array.isArray(roles)) return false;
        return roles.some(role => hasRole(role));
    };

    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole,
        user,
        permissions: user?.permissions || [],
        roles: user?.roles || [],
    };
};

// Alternative simple version if you don't have complex auth context
export const usePermissionsSimple = () => {
    // For now, return true for all permissions to avoid blocking UI
    // Replace this with actual permission logic later
    const hasPermission = () => true;
    const hasRole = () => true;
    const hasAnyPermission = () => true;
    const hasAnyRole = () => true;

    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole,
    };
};