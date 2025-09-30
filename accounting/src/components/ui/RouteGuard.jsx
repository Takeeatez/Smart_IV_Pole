import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RouteGuard = ({ children, requiredRoles = [], userRole, isAuthenticated = false }) => {
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Role-based route configuration
export const routePermissions = {
  '/dashboard': ['partner', 'staff', 'freelancer', 'client'],
  '/transactions-management': ['partner', 'staff', 'freelancer'],
  '/financial-reports': ['partner', 'staff', 'freelancer'],
  '/bank-reconciliation': ['partner', 'staff', 'freelancer'],
  '/client-portal': ['partner', 'staff', 'client'],
  '/tax-compliance-center': ['partner', 'staff'],
  '/user-management': ['partner'],
};

// Higher-order component for protecting routes
export const withRoleGuard = (Component, requiredRoles = []) => {
  return (props) => {
    const { userRole, isAuthenticated } = props;
    
    return (
      <RouteGuard 
        requiredRoles={requiredRoles} 
        userRole={userRole} 
        isAuthenticated={isAuthenticated}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };
};

// Hook for checking permissions
export const usePermissions = (userRole) => {
  const hasPermission = (route) => {
    const permissions = routePermissions[route];
    return permissions ? permissions.includes(userRole) : false;
  };

  const getAccessibleRoutes = () => {
    return Object.entries(routePermissions)
      .filter(([route, roles]) => roles.includes(userRole))
      .map(([route]) => route);
  };

  return {
    hasPermission,
    getAccessibleRoutes,
  };
};

export default RouteGuard;