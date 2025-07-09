
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Users,
  BarChart3,
  FileText,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  isLoading?: boolean;
}

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { name: 'Agents', href: '/agents', icon: Bot, roles: ['admin', 'user'] },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['admin', 'user'] },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen, roles: ['admin', 'user'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Templates', href: '/templates', icon: FileText, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'user'] },
  { name: 'Help', href: '/help', icon: HelpCircle, roles: ['admin', 'user'] },
];

export const Sidebar = ({ isOpen, onClose, userRole = 'user', isLoading = false }: SidebarProps) => {
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  if (isLoading) {
    return (
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 border-b border-border">
          <LoadingSpinner size="sm" text="Loading menu..." />
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-border">
            <h2 className="text-xl font-bold text-primary">7en.ai</h2>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
