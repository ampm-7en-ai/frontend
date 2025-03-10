
import React, { useState } from 'react';
import { Bell, Search, MessageCircle, User, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <header className="h-14 bg-white border-b border-[#E4E6EB] flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="lg:hidden mr-2">
          <Menu size={24} />
        </Button>
        
        <div className="hidden lg:flex">
          <h1 className="text-heading-3 font-semibold">{pageTitle}</h1>
        </div>
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="ml-4 hidden md:flex items-center text-sm text-medium-gray">
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
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative max-w-[200px] md:max-w-xs">
          <div className="relative rounded-full bg-light-gray focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-10 w-full pl-9 pr-4 rounded-full bg-light-gray border-none focus:outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-light-gray text-dark-gray hover:bg-[#E4E6EB]"
          >
            <Home size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-light-gray text-dark-gray hover:bg-[#E4E6EB]"
          >
            <MessageCircle size={20} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-light-gray text-dark-gray hover:bg-[#E4E6EB] relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="p-2 bg-white flex items-center justify-between border-b border-[#E4E6EB]">
                <DropdownMenuLabel className="font-semibold text-base">Notifications</DropdownMenuLabel>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:bg-accent"
                >
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="py-3 px-4 flex flex-col items-start hover:bg-light-gray focus:bg-light-gray">
                    <div className="flex items-start justify-between w-full">
                      <span className={`font-medium ${notification.read ? 'text-medium-gray' : 'text-black'}`}>
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-primary rounded-full ml-2 mt-1.5"></span>
                      )}
                    </div>
                    <span className="text-xs text-medium-gray mt-1">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="p-2 border-t border-[#E4E6EB] text-center">
                <Button variant="ghost" className="text-sm text-primary w-full hover:bg-accent">
                  See all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-dark-gray ml-2 h-10 px-1 md:px-2"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-primary text-white">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b border-[#E4E6EB]">
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-medium-gray">admin@example.com</p>
            </div>
            <DropdownMenuItem className="py-2 px-4 hover:bg-light-gray focus:bg-light-gray">Profile</DropdownMenuItem>
            <DropdownMenuItem className="py-2 px-4 hover:bg-light-gray focus:bg-light-gray">Settings</DropdownMenuItem>
            <DropdownMenuItem className="py-2 px-4 hover:bg-light-gray focus:bg-light-gray">Help Center</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2 px-4 text-destructive hover:bg-light-gray focus:bg-light-gray">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
