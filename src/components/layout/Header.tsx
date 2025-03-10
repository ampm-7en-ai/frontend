
import React, { useState } from 'react';
import { Bell, ChevronDown, HelpCircle, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HeaderProps = {
  pageTitle: string;
  breadcrumbs?: { label: string; href: string }[];
};

export function Header({ pageTitle, breadcrumbs }: HeaderProps) {
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
    <header className="h-16 bg-white border-b border-medium-gray/20 flex items-center justify-between px-4">
      <div className="flex items-center">
        <h1 className="text-heading-3 font-poppins">{pageTitle}</h1>
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="ml-4 flex items-center text-sm text-dark-gray">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-2 text-medium-gray">/</span>}
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-3.5 w-3.5" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="h-10 pl-9 pr-4 rounded-lg border border-medium-gray/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm w-64"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-white text-micro rounded-full flex items-center justify-center">
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
                  <span className={`font-medium ${notification.read ? 'text-dark-gray' : 'text-black'}`}>
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span className="h-2 w-2 bg-primary rounded-full ml-2 mt-1.5"></span>
                  )}
                </div>
                <span className="text-xs text-medium-gray mt-1">{notification.time}</span>
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
          className="text-dark-gray hover:text-primary"
        >
          <HelpCircle size={16} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-dark-gray hover:text-black"
            >
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white">
                <User size={14} />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-medium-gray">Admin</p>
              </div>
              <ChevronDown size={14} className="text-medium-gray" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
