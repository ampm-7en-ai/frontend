import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Users, 
  Bot, 
  Database, 
  Workflow, 
  Settings, 
  MessageSquare, 
  BarChart, 
  HelpCircle, 
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
  icon: React.ReactNode;
  title: string;
  href: string;
  isCollapsed: boolean;
  isActive?: boolean;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
};

type UserRole = 'user' | 'admin' | 'superadmin';

const SidebarItem = ({
  icon,
  title,
  href,
  isCollapsed,
  isActive = false,
  adminOnly = false,
  superAdminOnly = false,
}: SidebarItemProps) => {
  // This would normally check actual user permissions - for demo, we're showing everything
  const userRole: UserRole = "superadmin"; // Simulated role: 'user', 'admin', or 'superadmin'
  
  // Hide items based on role
  if ((adminOnly && userRole === 'user') || (superAdminOnly && userRole !== 'superadmin')) {
    return null;
  }

  return (
    <div className="mb-1">
      <Link
        to={href}
        className={cn(
          "flex items-center p-2 rounded-md text-dark-gray hover:bg-light-gray transition-colors duration-200",
          isActive && "bg-primary/10 text-primary border-l-4 border-primary pl-1",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <div className="flex items-center">
          <div className={cn(
            "flex items-center justify-center",
            isCollapsed ? "w-full" : "w-5 mr-3"
          )}>
            {icon}
          </div>
          {!isCollapsed && <span className="text-sm">{title}</span>}
        </div>
        
        {superAdminOnly && !isCollapsed && (
          <Shield className="h-3 w-3 text-primary" />
        )}
      </Link>
    </div>
  );
};

type SidebarSectionProps = {
  title: string;
  isCollapsed: boolean;
  children: React.ReactNode;
};

const SidebarSection = ({ title, isCollapsed, children }: SidebarSectionProps) => {
  return (
    <div className="mb-4">
      {!isCollapsed && (
        <div className="px-3 mb-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="px-3 space-y-1">
        {children}
      </div>
    </div>
  );
};

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-medium-gray/20 transition-all duration-300",
      isCollapsed ? "w-16" : "w-60",
      className
    )}>
      <div className="p-3 flex items-center justify-between border-b border-medium-gray/20">
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="text-primary font-poppins font-bold text-lg">7en.ai</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <span className="text-primary font-poppins font-bold text-lg">7</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md text-dark-gray hover:bg-light-gray transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <SidebarSection title="Main" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={<Home size={16} />} 
            title="Dashboard" 
            href="/" 
            isCollapsed={isCollapsed} 
            isActive={currentPath === '/'} 
          />
          
          <SidebarItem 
            icon={<Bot size={16} />} 
            title="Agents" 
            href="/agents" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.startsWith('/agents')} 
          />
          
          <SidebarItem 
            icon={<Database size={16} />} 
            title="Knowledge Base" 
            href="/knowledge" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.startsWith('/knowledge')} 
          />
          
          <SidebarItem 
            icon={<MessageSquare size={16} />} 
            title="Conversations" 
            href="/conversations" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.startsWith('/conversations')} 
          />
          
          <SidebarItem 
            icon={<BarChart size={16} />} 
            title="Analytics" 
            href="/analytics" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.startsWith('/analytics')} 
            adminOnly
          />
        </SidebarSection>
        
        <SidebarSection title="Administration" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={<Users size={16} />} 
            title="Users" 
            href="/users" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.startsWith('/users')} 
            adminOnly
          />
          
          <SidebarItem 
            icon={<Workflow size={16} />} 
            title="Workflows" 
            href="/workflows" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.startsWith('/workflows')} 
            adminOnly
          />
          
          <SidebarItem 
            icon={<Settings size={16} />} 
            title="Business Settings" 
            href="/settings/business/profile" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.includes('/settings/business')} 
            adminOnly
          />
          
          <SidebarItem 
            icon={<Shield size={16} />} 
            title="Platform Settings" 
            href="/settings/platform/general" 
            isCollapsed={isCollapsed} 
            isActive={currentPath.includes('/settings/platform')} 
            superAdminOnly
          />
        </SidebarSection>
      </div>

      <div className="p-3 border-t border-medium-gray/20">
        <SidebarItem 
          icon={<HelpCircle size={16} />} 
          title="Help & Support" 
          href="/help/documentation" 
          isCollapsed={isCollapsed} 
          isActive={currentPath.startsWith('/help')} 
        />
      </div>
    </div>
  );
}
