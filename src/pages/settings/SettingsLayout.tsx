
import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';
import PlatformSettingsNav from '@/components/settings/PlatformSettingsNav';

const SettingsLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  
  // Determine if we're in platform or business settings
  const isBusinessSettings = currentPath.includes('/settings/business');
  const isPlatformSettings = currentPath.includes('/settings/platform');
  
  // For Super Admin: Only show platform settings
  // For Admin: Only show business settings
  
  if (user?.role === 'superadmin' && isBusinessSettings) {
    // Redirect Super Admin away from business settings
    return <Navigate to="/settings/platform/general" replace />;
  } else if (user?.role === 'admin' && isPlatformSettings) {
    // Redirect Admin away from platform settings
    return <Navigate to="/settings/business/profile" replace />;
  }

  return (
    <MainLayout pageTitle="Settings" breadcrumbs={[
      { label: 'Dashboard', href: '/' },
      { label: 'Settings', href: '/settings' }
    ]}>
      <div className="flex flex-col space-y-6">
        <div className="container mx-auto flex">
          <div className="w-64 pr-8">
            <h3 className="text-lg font-semibold mb-4">
              {isPlatformSettings && user?.role === 'superadmin' 
                ? 'Platform Settings' 
                : 'Business Settings'}
            </h3>
            <Separator className="mb-4" />
            
            {/* Conditionally render the appropriate navigation component */}
            {isPlatformSettings && user?.role === 'superadmin' ? (
              <PlatformSettingsNav />
            ) : (
              <BusinessSettingsNav />
            )}
          </div>
          <div className="flex-1 pl-8 border-l">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsLayout;
