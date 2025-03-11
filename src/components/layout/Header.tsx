
import React, { useState } from 'react';
import { Bell, ChevronDown, HelpCircle, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

type HeaderProps = {
  pageTitle: string;
  breadcrumbs?: { label: string; href: string }[];
  toggleSidebar: () => void;
};

export function Header({ pageTitle, breadcrumbs, toggleSidebar }: HeaderProps) {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New agent deployed', time: '5 min ago', read: false },
    { id: 2, title: 'Integration successful', time: '1 hour ago', read: false },
    { id: 3, title: 'System update scheduled', time: '2 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-800">{pageTitle}</h1>
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden md:flex items-center text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-2 text-slate-400">/</span>}
                <a 
                  href={crumb.href} 
                  className="hover:text-primary transition-colors duration-200"
                >
                  {crumb.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="h-9 pl-9 pr-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm w-64"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
            >
              <Bell size={18} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-micro rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-hover"
              >
                Mark all as read
              </Button>
            </div>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="py-3 flex flex-col items-start">
                <div className="flex items-start justify-between w-full">
                  <span className={`font-medium ${notification.read ? 'text-slate-600' : 'text-slate-800'}`}>
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span className="h-2 w-2 bg-primary rounded-full ml-2 mt-1.5"></span>
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-1">{notification.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2 flex justify-center">
              <span className="text-sm text-primary hover:underline">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-slate-600 hover:text-primary"
        >
          <HelpCircle size={18} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={16} />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
