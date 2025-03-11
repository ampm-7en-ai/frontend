import React from 'react';
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  MessageSquare,
  Bot,
  Book,
  HelpCircle,
  PlusCircle,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { logout, user } = useAuth();
  const userRole = user?.role;

  // Common navigation items
  const commonItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Conversations', href: '/conversations', icon: MessageSquare },
    { label: 'Agents', href: '/agents', icon: Bot },
    { label: 'Knowledge Base', href: '/knowledge', icon: Book },
  ];

  // Role-based navigation items
  const adminItems = [
    { label: 'Settings', href: '/settings', icon: Settings, children: [
      { label: 'Business Profile', href: '/settings/business/profile' },
      { label: 'Team Settings', href: '/settings/business/team' },
      { label: 'Agent Settings', href: '/settings/business/agents' },
      { label: 'Integrations', href: '/settings/business/integrations' },
      { label: 'Billing', href: '/settings/business/billing' },
      { label: 'Preferences', href: '/settings/business/preferences' },
    ]},
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Help & Support', href: '/help/support', icon: HelpCircle },
  ];

  const superAdminItems = [
    { label: 'Platform Settings', href: '/settings', icon: LayoutDashboard, children: [
      { label: 'General', href: '/settings/platform/general' },
      { label: 'Security', href: '/settings/platform/security' },
      { label: 'LLM Providers', href: '/settings/platform/llm-providers' },
      { label: 'Compliance', href: '/settings/platform/compliance' },
      { label: 'Billing', href: '/settings/platform/billing' },
      { label: 'Customization', href: '/settings/platform/customization' },
    ]},
  ];

  // Fix the type comparison by using proper type checking
  const navigationItems = userRole === "superadmin" ? [...adminItems, ...superAdminItems] : adminItems;

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-60'} border-r border-r-medium-gray/10 transition-width duration-300`}>
      <div className="flex items-center h-20 px-4">
        <span className={`text-2xl font-bold ${isCollapsed ? 'hidden' : ''}`}>7en.ai</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {commonItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isActive ? 'bg-light-gray text-primary' : 'text-dark-gray hover:bg-light-gray'}`
            }
          >
            <item.icon className="w-4 h-4 mr-2" />
            <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
          </NavLink>
        ))}
        {navigationItems.map((item) => (
          <div key={item.label}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${isActive ? 'bg-light-gray text-primary' : 'text-dark-gray hover:bg-light-gray'}`
              }
            >
              <item.icon className="w-4 h-4 mr-2" />
              <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
            </NavLink>
            {item.children && item.children.map((child) => (
              <NavLink
                key={child.label}
                to={child.href}
                className={({ isActive }) =>
                  `flex items-center px-5 py-2 text-sm font-medium rounded-md
                  ${isActive ? 'bg-light-gray text-primary' : 'text-dark-gray hover:bg-light-gray'} ${isCollapsed ? 'hidden' : ''}`
                }
              >
                <span className="ml-6">{child.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center px-3 py-2 text-sm font-medium text-dark-gray hover:bg-light-gray rounded-md w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className={`${isCollapsed ? 'hidden' : ''}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
