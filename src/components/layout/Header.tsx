
import React, { useState } from 'react';
import { Bell, ChevronDown, HelpCircle, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

type HeaderProps = {
  pageTitle: string;
  breadcrumbs?: { label: string; href: string }[];
  toggleSidebar: () => void;
  onLogout?: () => void;
};

export function Header({ pageTitle, breadcrumbs, toggleSidebar, onLogout }: HeaderProps) {
  const { logout } = useAuth();
  const { notifications, markAllAsRead, markAsRead } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;



  // Use the passed onLogout function if provided, otherwise use the one from context
  const handleLogout = onLogout || logout;

  return (
    <header className="h-16 bg-white border-b border-medium-gray/10 px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden h-8 w-8">
          <Menu className="h-4 w-4 text-dark-gray" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <h1 className="text-base font-semibold text-black tracking-tight">{pageTitle}</h1>
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden md:block ml-2">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-dark-gray h-3.5 w-3.5" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="h-8 pl-8 pr-4 rounded-md border border-medium-gray/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm w-60 bg-light-gray/50"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 rounded-full hover:bg-light-gray/50"
            >
              <Bell size={16} className="text-dark-gray" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-primary text-white text-[8px] font-medium rounded-full flex items-center justify-center">
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
            {notifications.map((notification: Notification) => (
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
            ))}
            </div>
            <DropdownMenuSeparator className="my-0.5" />
            <DropdownMenuItem className="py-1.5 text-center justify-center text-xs text-primary hover:text-primary-hover hover:bg-accent">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-full text-dark-gray hover:bg-light-gray/50"
        >
          <HelpCircle size={16} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-1.5 h-8 px-1.5 py-1 rounded-md hover:bg-light-gray/50"
            >
              <Avatar className="h-6 w-6 bg-primary/90 flex items-center justify-center text-white text-xs font-medium">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-black leading-none">Admin User</p>
                <p className="text-[10px] text-dark-gray mt-0.5">Admin</p>
              </div>
              <ChevronDown size={12} className="hidden md:block text-dark-gray" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-1">
            <div className="px-3 pt-2 pb-1">
              <p className="text-xs font-medium text-black">Admin User</p>
              <p className="text-[10px] text-dark-gray">admin@example.com</p>
            </div>
            <DropdownMenuSeparator className="my-0.5" />
            <DropdownMenuItem className="py-1.5 text-xs">Profile</DropdownMenuItem>
            <DropdownMenuItem className="py-1.5 text-xs">Settings</DropdownMenuItem>
            <DropdownMenuItem className="py-1.5 text-xs">Billing</DropdownMenuItem>
            <DropdownMenuSeparator className="my-0.5" />
            <DropdownMenuItem 
              className="py-1.5 text-xs text-destructive focus:text-destructive focus:bg-destructive/5" 
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
