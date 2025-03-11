
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
  LogOut,
  ChevronRight,
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
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm`}>
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <span className={`text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent ${isCollapsed ? 'hidden' : ''}`}>7en.ai</span>
        {isCollapsed && <span className="text-xl font-bold text-primary mx-auto">7</span>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-2">
          {commonItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
            </NavLink>
          ))}
        </div>
        
        {navigationItems.length > 0 && (
          <div className="pt-4">
            <div className={`text-xs font-semibold text-slate-400 uppercase px-3 mb-2 ${isCollapsed ? 'hidden' : ''}`}>Administration</div>
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  <NavLink
                    to={item.href}
                    end={!!item.children}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg
                      ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`
                    }
                  >
                    <div className="flex items-center">
                      <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                      <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                    </div>
                    {item.children && !isCollapsed && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </NavLink>
                  {item.children && !isCollapsed && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.label}
                          to={child.href}
                          className={({ isActive }) =>
                            `flex items-center pl-10 pr-3 py-2 text-sm font-medium rounded-lg
                            ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`
                          }
                        >
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} text-slate-500`} />
          <span className={`${isCollapsed ? 'hidden' : ''}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
