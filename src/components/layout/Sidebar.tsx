
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Users, 
  MessagesSquare, 
  Database, 
  GitBranch, 
  Settings, 
  MessageCircle, 
  BarChart, 
  Link2, 
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
          isActive && "bg-accent text-primary font-medium",
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
            isCollapsed ? "w-full" : "w-8 mr-3"
          )}>
            {icon}
          </div>
          {!isCollapsed && <span className="text-body">{title}</span>}
        </div>
        {!isCollapsed && hasSubMenu && (
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform duration-200",
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
      "flex flex-col h-screen bg-white border-r border-[#E4E6EB] transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-3 flex items-center justify-between border-b border-[#E4E6EB]">
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="text-primary font-inter font-bold text-2xl">facebook</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <span className="text-primary font-inter font-bold text-2xl">f</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full text-dark-gray hover:bg-light-gray transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-2 space-y-1">
          <SidebarItem 
            icon={<Home size={24} />} 
            title="Home" 
            href="/" 
            isCollapsed={isCollapsed} 
            isActive={true} 
          />
          
          <SidebarItem 
            icon={<MessagesSquare size={24} />} 
            title="Agent Management" 
            href="/agents" 
            isCollapsed={isCollapsed} 
            hasSubMenu={!isCollapsed}
          >
            <Link to="/agents" className="text-body p-2 block text-dark-gray hover:text-primary">
              All Agents
            </Link>
            <Link to="/agents/create" className="text-body p-2 block text-dark-gray hover:text-primary">
              Create Agent
            </Link>
          </SidebarItem>
          
          <SidebarItem 
            icon={<Database size={24} />} 
            title="Knowledge Base" 
            href="/knowledge" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<GitBranch size={24} />} 
            title="Workflows" 
            href="/workflows" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<MessageCircle size={24} />} 
            title="Conversations" 
            href="/conversations" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<BarChart size={24} />} 
            title="Analytics" 
            href="/analytics" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<Link2 size={24} />} 
            title="Integrations" 
            href="/integrations" 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarItem 
            icon={<Users size={24} />} 
            title="User Management" 
            href="/users" 
            isCollapsed={isCollapsed} 
          />
        </div>
      </div>

      <div className="p-2 border-t border-[#E4E6EB]">
        <SidebarItem 
          icon={<Settings size={24} />} 
          title="Settings" 
          href="/settings" 
          isCollapsed={isCollapsed} 
        />
        
        <SidebarItem 
          icon={<HelpCircle size={24} />} 
          title="Help & Support" 
          href="/help" 
          isCollapsed={isCollapsed} 
        />
      </div>
    </div>
  );
}
