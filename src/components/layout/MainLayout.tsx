
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export type MainLayoutProps = {
  pageTitle?: string;
  breadcrumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
};

export function MainLayout({ pageTitle, breadcrumbs, children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const isConversationsPage = location.pathname.includes('/conversations');
  const isAgentEditPage = location.pathname.includes('/agents') && location.pathname.includes('/edit');
  const isAgentTestPage = location.pathname.includes('/agents') && location.pathname.includes('/test');

  return (
    <div className="flex h-screen bg-light-gray/50 overflow-hidden w-full">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden relative bg-neutral-100 dark:bg-[hsla(0,0%,0%,0.95)]">
        {/* Floating Notifications */}
        {/* <div className="absolute top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <Bell size={18} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mt-1">
              <div className="flex items-center justify-between p-2 border-b border-medium-gray/10">
                <DropdownMenuLabel className="text-sm font-medium">Notifications</DropdownMenuLabel>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-6 text-primary hover:text-primary-hover hover:bg-accent"
                >
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-[280px] overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="py-1.5 px-3 flex flex-col items-start focus:bg-accent"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className={`font-medium text-xs ${notification.read ? 'text-dark-gray' : 'text-black'}`}>
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="h-1.5 w-1.5 bg-primary rounded-full mt-1"></span>
                        )}
                      </div>
                      <span className="text-xs text-dark-gray/80 mt-0.5">{notification.message}</span>
                      <span className="text-[10px] text-dark-gray mt-0.5">
                        {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator className="my-0.5" />
              <DropdownMenuItem className="py-1.5 text-center justify-center text-xs text-primary hover:text-primary-hover hover:bg-accent">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}

        <main className={`flex-1 overflow-x-hidden ${isConversationsPage || isAgentEditPage || isAgentTestPage ? 'overflow-hidden p-0' : 'overflow-y-auto'}`}>
          <div className={`${isConversationsPage || isAgentEditPage || isAgentTestPage ? 'h-full' : ''}`}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Apply fullwidth style only to conversations page, agent edit page, or agent test page */}
      {(isConversationsPage || isAgentEditPage || isAgentTestPage) && (
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
