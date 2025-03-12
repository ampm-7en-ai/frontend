
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
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
  
  if (user?.role === 'superadmin' && isBusinessSettings) {
    return <Navigate to="/settings/platform/general" replace />;
  } else if (user?.role === 'admin' && isPlatformSettings) {
    return <Navigate to="/settings/business/profile" replace />;
  }

  return (
    <div className="flex-1 flex">
      <div className="w-64 flex-shrink-0 border-r border-medium-gray/10">
        <div className="p-6">
          <h3 className="text-lg font-semibold">
            {isPlatformSettings && user?.role === 'superadmin' 
              ? 'Platform Settings' 
              : 'Business Settings'}
          </h3>
          <Separator className="my-4" />
          {isPlatformSettings && user?.role === 'superadmin' ? (
            <PlatformSettingsNav />
          ) : (
            <BusinessSettingsNav />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
