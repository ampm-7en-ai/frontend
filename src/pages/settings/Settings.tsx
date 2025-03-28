
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PlatformSettingsNav from '@/components/settings/PlatformSettingsNav';

const Settings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Determine active tab - now we only have platform settings
  const getActiveTab = () => {
    return 'platform';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  // Redirect to the platform settings
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/platform/general" replace />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <PlatformSettingsNav />
        </div>
        
        <div className="col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
