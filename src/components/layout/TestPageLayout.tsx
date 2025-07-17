
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function TestPageLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // If still loading auth state, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
}
