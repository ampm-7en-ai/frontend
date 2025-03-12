
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';

export type MainLayoutProps = {
  pageTitle?: string;
  breadcrumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
};

export function MainLayout({ pageTitle, breadcrumbs, children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Extract page title from path if not provided as prop
  const getPageTitle = (path: string) => {
    if (pageTitle) return pageTitle;
    
    // For analytics page
    if (path.includes('/analytics')) {
      return 'Platform Analytics';
    }
    
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    
    return segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Force settings pages to have the correct title
  const derivedTitle = location.pathname.includes('/settings') 
    ? 'Settings'
    : getPageTitle(location.pathname);

  // Default breadcrumbs for analytics page
  const defaultBreadcrumbs = location.pathname.includes('/analytics')
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics', href: '/analytics' }
      ]
    : breadcrumbs;

  return (
    <div className="flex h-screen bg-light-gray/50">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-[276px] top-1/2 -translate-y-1/2 z-50 hidden md:flex"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        style={{ left: isSidebarCollapsed ? '76px' : '276px' }}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={derivedTitle}
          breadcrumbs={defaultBreadcrumbs}
          onLogout={logout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
