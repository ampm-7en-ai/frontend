
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const SettingsLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine if we're in platform or business settings
  const isBusinessSettings = currentPath.includes('/settings/business');
  const isPlatformSettings = currentPath.includes('/settings/platform');
  const defaultValue = isBusinessSettings ? 'business' : 'platform';

  const platformLinks = [
    { name: 'General', path: '/settings/platform/general' },
    { name: 'Security', path: '/settings/platform/security' },
    { name: 'LLM Providers', path: '/settings/platform/llm-providers' },
    { name: 'Compliance', path: '/settings/platform/compliance' },
    { name: 'Billing', path: '/settings/platform/billing' },
    { name: 'Customization', path: '/settings/platform/customization' },
  ];

  const businessLinks = [
    { name: 'Profile', path: '/settings/business/profile' },
    { name: 'Team', path: '/settings/business/team' },
    { name: 'Agents', path: '/settings/business/agents' },
    { name: 'Integrations', path: '/settings/business/integrations' },
    { name: 'Billing', path: '/settings/business/billing' },
    { name: 'Preferences', path: '/settings/business/preferences' },
  ];

  return (
    <MainLayout pageTitle="Settings" breadcrumbs={[
      { label: 'Dashboard', href: '/' },
      { label: 'Settings', href: '/settings' }
    ]}>
      <div className="flex flex-col space-y-6">
        <div className="container mx-auto">
          <Tabs defaultValue={defaultValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="platform" asChild>
                <Link to="/settings/platform/general" className={`${isPlatformSettings ? 'font-semibold' : ''}`}>
                  Platform Settings
                </Link>
              </TabsTrigger>
              <TabsTrigger value="business" asChild>
                <Link to="/settings/business/profile" className={`${isBusinessSettings ? 'font-semibold' : ''}`}>
                  Business Settings
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="container mx-auto flex">
          <div className="w-64 pr-8">
            <h3 className="text-lg font-semibold mb-4">
              {isPlatformSettings ? 'Platform Settings' : 'Business Settings'}
            </h3>
            <Separator className="mb-4" />
            <nav className="flex flex-col space-y-1">
              {isPlatformSettings &&
                platformLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-md text-sm ${
                      currentPath === link.path
                        ? 'bg-primary text-white'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              {isBusinessSettings &&
                businessLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-md text-sm ${
                      currentPath === link.path
                        ? 'bg-primary text-white'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </nav>
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
