
import React, { useState } from 'react';
import { Bell, ChevronDown, HelpCircle, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    <header className="h-16 bg-white border-b border-slate-100 px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5 text-slate-600" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">{pageTitle}</h1>
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden md:flex items-center text-sm text-slate-400">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="mx-1">/</span>}
                  <a 
                    href={crumb.href} 
                    className="hover:text-slate-600 transition-colors duration-200"
                  >
                    {crumb.label}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="h-9 pl-9 pr-4 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-all text-sm w-64 bg-slate-50"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 rounded-full"
            >
              <Bell size={18} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-1">
            <div className="flex items-center justify-between p-3 border-b">
              <DropdownMenuLabel className="text-sm font-medium">Notifications</DropdownMenuLabel>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto py-1">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="py-2 px-3 flex flex-col items-start focus:bg-slate-50">
                  <div className="flex items-start justify-between w-full">
                    <span className={`font-medium text-sm ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                      {notification.title}
                    </span>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full mt-1"></span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">{notification.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2 text-center justify-center text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100"
        >
          <HelpCircle size={18} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 h-9 px-2 rounded-full hover:bg-slate-100"
            >
              <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700 leading-none">Admin User</p>
                <p className="text-xs text-slate-500 mt-0.5">Admin</p>
              </div>
              <ChevronDown size={14} className="hidden md:block text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <div className="px-3 pt-2 pb-1">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">admin@example.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-1.5 text-sm">Profile</DropdownMenuItem>
            <DropdownMenuItem className="py-1.5 text-sm">Settings</DropdownMenuItem>
            <DropdownMenuItem className="py-1.5 text-sm">Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="py-1.5 text-sm text-red-500 focus:text-red-500 focus:bg-red-50" 
              onClick={logout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
