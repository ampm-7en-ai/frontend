
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

export type MainLayoutProps = {
  pageTitle?: string;
  breadcrumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
};

export function MainLayout({ pageTitle, breadcrumbs, children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    if (pageTitle) return pageTitle;
    
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

  const derivedTitle = location.pathname.includes('/settings') 
    ? 'Settings'
    : getPageTitle(location.pathname);

  const defaultBreadcrumbs = location.pathname.includes('/analytics')
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics', href: '/analytics' }
      ]
    : breadcrumbs;

  const isConversationsPage = location.pathname.includes('/conversations');

  return (
    <div className="flex h-screen bg-light-gray/50 overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={derivedTitle}
          breadcrumbs={defaultBreadcrumbs}
          onLogout={logout}
          toggleSidebar={toggleSidebar}
        />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isConversationsPage ? 'p-0' : 'p-6'}`}>
          {children || <Outlet />}
        </main>
      </div>
      
      {/* Apply fullwidth style only to conversations page */}
      {isConversationsPage && (
        <style dangerouslySetInnerHTML={{ __html: `
          main {
            padding: 0 !important;
            max-width: none !important;
          }
        `}} />
      )}
    </div>
  );
}
