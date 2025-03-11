
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';

type MainLayoutProps = {
  children: React.ReactNode;
  pageTitle: string;
  breadcrumbs?: { label: string; href: string }[];
};

export function MainLayout({ children, pageTitle, breadcrumbs }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-light-gray/50">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={pageTitle} 
          breadcrumbs={breadcrumbs} 
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
