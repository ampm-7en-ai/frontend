
import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  MessageSquare,
  Bot,
  Book,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { logout, user } = useAuth();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  // Common navigation items
  const commonItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home },
    { id: 'conversations', label: 'Conversations', href: '/conversations', icon: MessageSquare },
    { id: 'agents', label: 'Agents', href: '/agents', icon: Bot },
    { id: 'knowledge', label: 'Knowledge Base', href: '/knowledge', icon: Book },
  ];

  // Role-based navigation items
  const adminItems = [
    { 
      id: 'settings',
      label: 'Settings', 
      href: '/settings', 
      icon: Settings, 
      children: [
        { label: 'Business Profile', href: '/settings/business/profile' },
        { label: 'Team Settings', href: '/settings/business/team' },
        { label: 'Agent Settings', href: '/settings/business/agents' },
        { label: 'Integrations', href: '/settings/business/integrations' },
        { label: 'Billing', href: '/settings/business/billing' },
        { label: 'Preferences', href: '/settings/business/preferences' },
      ]
    },
    { id: 'users', label: 'Users', href: '/users', icon: Users },
    { id: 'help', label: 'Help & Support', href: '/help/support', icon: HelpCircle },
  ];

  const superAdminItems = [
    { 
      id: 'platform',
      label: 'Platform Settings', 
      href: '/settings', 
      icon: LayoutDashboard, 
      children: [
        { label: 'General', href: '/settings/platform/general' },
        { label: 'Security', href: '/settings/platform/security' },
        { label: 'LLM Providers', href: '/settings/platform/llm-providers' },
        { label: 'Compliance', href: '/settings/platform/compliance' },
        { label: 'Billing', href: '/settings/platform/billing' },
        { label: 'Customization', href: '/settings/platform/customization' },
      ]
    },
  ];

  const navigationItems = userRole === "superadmin" ? [...adminItems, ...superAdminItems] : adminItems;

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-medium-gray/20 transition-all duration-300 ease-in-out shadow-sidebar overflow-hidden`}>
      <div className="flex items-center h-14 px-4 border-b border-medium-gray/20">
        {!isCollapsed ? (
          <span className="text-xl font-bold text-primary">7en.ai</span>
        ) : (
          <span className="text-xl font-bold text-primary mx-auto">7</span>
        )}
      </div>
      
      <div className="px-2 py-3 border-b border-medium-gray/20">
        {!isCollapsed ? (
          <div className="flex items-center px-2">
            <Avatar className="h-8 w-8 bg-primary text-white">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <p className="text-sm font-medium text-black leading-tight">Admin User</p>
              <p className="text-xs text-dark-gray">admin@example.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8 bg-primary text-white">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {commonItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-sm rounded-lg
                ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
              }
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
        
        {navigationItems.length > 0 && (
          <div className="pt-4">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-dark-gray uppercase px-2 mb-2">Administration</div>
            )}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start px-2 py-2 text-sm rounded-lg ${expandedItems.includes(item.id) ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`}
                        onClick={() => !isCollapsed && toggleExpand(item.id)}
                      >
                        <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {expandedItems.includes(item.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </Button>
                      {!isCollapsed && expandedItems.includes(item.id) && item.children && (
                        <div className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.label}
                              to={child.href}
                              className={({ isActive }) =>
                                `flex items-center pl-10 pr-2 py-1.5 text-sm rounded-lg
                                ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
                              }
                            >
                              <span>{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center px-2 py-2 text-sm rounded-lg
                        ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
                      }
                    >
                      <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      <div className="p-2 border-t border-medium-gray/20">
        <button
          onClick={logout}
          className={`flex items-center w-full px-2 py-2 text-sm rounded-lg text-black hover:bg-secondary ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} text-dark-gray`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
