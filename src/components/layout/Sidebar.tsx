
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
  ChevronRight,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  // Common navigation items for all roles
  const commonItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home },
    { id: 'conversations', label: 'Conversations', href: '/conversations', icon: MessageSquare },
    { id: 'agents', label: 'Agents', href: '/agents', icon: Bot },
    { id: 'knowledge', label: 'Knowledge Base', href: '/knowledge', icon: Book },
  ];

  // Business Admin specific navigation items
  const adminItems = [
    { 
      id: 'settings',
      label: 'Business Settings', 
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
    { id: 'help', label: 'Help & Support', href: '/help/support', icon: HelpCircle },
  ];

  // Super Admin specific navigation items
  const superAdminItems = [
    { id: 'users', label: 'User Management', href: '/users', icon: Users },
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

  // Determine navigation items based on role
  const roleBasedItems = userRole === "superadmin" 
    ? [...superAdminItems, ...adminItems] 
    : adminItems;

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-medium-gray/10 transition-all duration-300 ease-in-out shadow-sm overflow-hidden`}>
      <div className="flex items-center h-16 px-4 border-b border-medium-gray/10">
        {!isCollapsed ? (
          <span className="text-lg font-bold text-primary">7en.ai</span>
        ) : (
          <span className="text-lg font-bold text-primary mx-auto">7</span>
        )}
      </div>
      
      <div className="px-3 py-3 border-b border-medium-gray/10">
        {!isCollapsed ? (
          <div className="flex items-center px-2">
            <Avatar className="h-8 w-8 bg-primary/90 text-white">
              <AvatarFallback className="text-xs">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <p className="text-sm font-medium text-black leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-gray">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8 bg-primary/90 text-white">
              <AvatarFallback className="text-xs">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="space-y-1.5">
          {commonItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm rounded-md
                ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
              }
            >
              <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </div>
        
        {roleBasedItems.length > 0 && (
          <div className="pt-4">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-dark-gray uppercase px-3 mb-2">
                {userRole === "superadmin" ? "Administration" : "Settings"}
              </div>
            )}
            <div className="space-y-1.5">
              {roleBasedItems.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-3 text-sm rounded-md h-auto 
                        ${expandedItems.includes(item.id) ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`}
                        onClick={() => !isCollapsed && toggleExpand(item.id)}
                      >
                        <div className="flex items-center">
                          <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                          {!isCollapsed && <span className="text-sm">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          expandedItems.includes(item.id) ? 
                            <ChevronDown className="w-4 h-4" /> :
                            <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {!isCollapsed && expandedItems.includes(item.id) && item.children && (
                        <div className="mt-1 space-y-1 pl-8">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.label}
                              to={child.href}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2.5 text-sm rounded-md
                                ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
                              }
                            >
                              <span className="text-sm">{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-3 text-sm rounded-md
                        ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
                      }
                    >
                      <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                      {!isCollapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-medium-gray/10 p-3">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-center py-2.5 text-sm"
          onClick={logout}
        >
          <LogOut className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-2'} text-dark-gray`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
