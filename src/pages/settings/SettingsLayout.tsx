
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Settings, Shield, Cloud, FileCheck, CreditCard, Palette, 
  Building, Users, Bot, Link2, Wallet, Sliders 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock function to check if user is super admin
const isSuperAdmin = () => true;

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const NavItem = ({ to, icon, children }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary/10 text-primary border-l-4 border-primary pl-3" 
          : "text-dark-gray hover:bg-light-gray"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      <span>{children}</span>
    </NavLink>
  );
};

const SettingsLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(
    location.pathname.includes('/settings/platform') ? 'platform' : 'business'
  );
  
  // If user navigates directly to /settings, redirect to appropriate section
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/platform/general" replace />;
  }

  return (
    <MainLayout 
      pageTitle="Settings" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Settings', href: '/settings' },
      ]}
    >
      <div className="bg-white rounded-lg border border-medium-gray/20 overflow-hidden">
        <div className="border-b border-medium-gray/20 p-4">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value)}
            className="w-full max-w-md"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="platform" 
                disabled={!isSuperAdmin()}
                onClick={() => location.pathname.includes('/settings/business') && 
                  window.location.href = '/settings/platform/general'}
              >
                Platform Settings
              </TabsTrigger>
              <TabsTrigger 
                value="business"
                onClick={() => location.pathname.includes('/settings/platform') && 
                  window.location.href = '/settings/business/profile'}
              >
                Business Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex">
          {/* Left Navigation */}
          <div className="w-64 border-r border-medium-gray/20 p-4 min-h-[calc(100vh-12rem)]">
            {activeTab === 'platform' && isSuperAdmin() && (
              <nav className="space-y-1">
                <NavItem to="/settings/platform/general" icon={<Settings />}>General</NavItem>
                <NavItem to="/settings/platform/security" icon={<Shield />}>Security</NavItem>
                <NavItem to="/settings/platform/llm-providers" icon={<Cloud />}>LLM Providers</NavItem>
                <NavItem to="/settings/platform/compliance" icon={<FileCheck />}>Compliance</NavItem>
                <NavItem to="/settings/platform/billing" icon={<CreditCard />}>Billing</NavItem>
                <NavItem to="/settings/platform/customization" icon={<Palette />}>Customization</NavItem>
              </nav>
            )}
            
            {activeTab === 'business' && (
              <nav className="space-y-1">
                <NavItem to="/settings/business/profile" icon={<Building />}>Profile</NavItem>
                <NavItem to="/settings/business/team" icon={<Users />}>Team</NavItem>
                <NavItem to="/settings/business/agents" icon={<Bot />}>Agents</NavItem>
                <NavItem to="/settings/business/integrations" icon={<Link2 />}>Integrations</NavItem>
                <NavItem to="/settings/business/billing" icon={<Wallet />}>Billing</NavItem>
                <NavItem to="/settings/business/preferences" icon={<Sliders />}>Preferences</NavItem>
              </nav>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsLayout;
