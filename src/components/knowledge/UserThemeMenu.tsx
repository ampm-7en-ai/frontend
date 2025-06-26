
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useKnowledgeTheme } from '@/hooks/useKnowledgeTheme';

const UserThemeMenu = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useKnowledgeTheme();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all duration-200">
            <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium">
              {user?.name ? getUserInitials(user.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={toggleTheme}
          className="flex items-center gap-2 cursor-pointer"
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4" />
              Switch to Dark
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              Switch to Light
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-slate-400">
          {user?.name || 'User'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserThemeMenu;
