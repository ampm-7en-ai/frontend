
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Link as LinkIcon, 
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
  icon: React.ReactNode;
  title: string;
  href: string;
  isCollapsed: boolean;
  isActive?: boolean;
  hasSubMenu?: boolean;
  children?: React.ReactNode;
};

const SidebarItem = ({
  icon,
  title,
  href,
  isCollapsed,
  isActive = false,
  hasSubMenu = false,
  children,
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-1">
      <Link
        to={href}
        className={cn(
          "flex items-center p-2 rounded-md text-dark-gray hover:bg-light-gray transition-colors duration-200",
          isActive && "bg-primary/10 text-primary border-l-4 border-primary pl-1",
          isCollapsed ? "justify-center" : "justify-between"
        )}
        onClick={hasSubMenu ? (e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        } : undefined}
      >
        <div className="flex items-center">
          <div className={cn(
            "flex items-center justify-center",
            isCollapsed ? "w-full" : "w-6 mr-3"
          )}>
            {icon}
          </div>
          {!isCollapsed && <span className="text-sm">{title}</span>}
        </div>
        {!isCollapsed && hasSubMenu && (
          <ChevronRight className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "transform rotate-90"
          )} />
        )}
      </Link>
      {hasSubMenu && isOpen && !isCollapsed && (
        <div className="ml-8 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          <SidebarItem 
            icon={<Home size={14} />} 
            title="Dashboard" 
            href="/" 
            isCollapsed={isCollapsed} 
            isActive={true} 
          />
          
          <SidebarItem 
            icon={<Bot size={14} />} 
            title="Agent Management" 
            href="/agents" 
            isCollapsed={isCollapsed} 
            hasSubMenu={!isCollapsed}
          >
            <Link to="/agents" className="text-sm p-2 block text-dark-gray hover:text-primary">
              All Agents
            </Link>
            <Link to="/agents/create" className="text-sm p-2 block text-dark-gray hover:text-primary">
              Create Agent
            </Link>
          </SidebarItem>
          
          <SidebarItem 
            icon={<Database size={14} />} 
            title="Knowledge Base" 
            href="/knowledge" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<Workflow size={14} />} 
            title="Workflows" 
            href="/workflows" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<MessageSquare size={14} />} 
            title="Conversations" 
            href="/conversations" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<BarChart size={14} />} 
            title="Analytics" 
            href="/analytics" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<LinkIcon size={14} />} 
            title="Integrations" 
            href="/integrations" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<Users size={14} />} 
            title="User Management" 
            href="/users" 
            isCollapsed={isCollapsed} 
          />
        </div>
      </div>

      <div className="p-3 border-t border-medium-gray/20">
        <SidebarItem 
          icon={<Settings size={14} />} 
          title="Settings" 
          href="/settings" 
          isCollapsed={isCollapsed} 
        />
        
        <SidebarItem 
          icon={<HelpCircle size={14} />} 
          title="Help & Support" 
          href="/help" 
          isCollapsed={isCollapsed} 
        />
      </div>
    </div>
  );
}
