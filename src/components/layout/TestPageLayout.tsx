
import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function TestPageLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // If still loading auth state, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <div className="min-h-screen w-full">
      <div className="dotted-background min-h-screen">
        <main className="max-w-[1400px] mx-auto p-4">
          <Outlet />
        </main>
      </div>
      
      {/* Add the dotted background pattern styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dotted-background {
          background-color: #f8f9fa;
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />
    </div>
  );
}
