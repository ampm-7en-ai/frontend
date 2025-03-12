
import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/context/AuthContext';

// Route protection component for role-based access
export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  userRole, 
  fallbackPath = '/login' 
}: { 
  children: React.ReactNode; 
  allowedRoles: UserRole[]; 
  userRole: UserRole | undefined; 
  fallbackPath?: string;
}) => {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Determine the dashboard path based on user role
export const getDashboardPath = (role?: UserRole): string => {
  switch (role) {
    case 'superadmin':
      return '/dashboard/superadmin';
    case 'admin':
      return '/dashboard/admin';
    case 'user':
      return '/dashboard/user';
    default:
      return '/login';
  }
};
