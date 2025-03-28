
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PlatformSettingsNav from '@/components/settings/PlatformSettingsNav';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';

const Settings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Determine active tab
  const getActiveTab = () => {
    if (location.pathname.includes('/settings/platform')) return 'platform';
    if (location.pathname.includes('/settings/business')) return 'business';
    return 'business'; // Default tab
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  // Redirect to the appropriate tab's first item
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/business/profile" replace />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger 
            value="business" 
            asChild
          >
            <Link to="/settings/business/profile">Business</Link>
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger 
              value="platform" 
              asChild
            >
              <Link to="/settings/platform/general">Platform</Link>
            </TabsTrigger>
          )}
        </TabsList>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1">
            {activeTab === 'business' ? (
              <BusinessSettingsNav />
            ) : (
              <PlatformSettingsNav />
            )}
          </div>
          
          <div className="col-span-3">
            <Outlet />
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
