
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Users,
  Plus,
  Building2,
  Zap,
  HelpCircle,
  Search,
  Shield,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AgentCreationWizard from '@/components/agents/wizard/AgentCreationWizard';

interface NavItem {
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  badge?: string;
  children?: NavItem[];
  requiresAdmin?: boolean;
}

const navigationItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/agents', icon: Bot, label: 'Agents' },
  { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
  { path: '/billing', icon: BarChart3, label: 'Billing' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/integrations', icon: Zap, label: 'Integrations' },
  { path: '/support', icon: HelpCircle, label: 'Support' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/security', icon: Shield, label: 'Security' },
  { path: '/contact', icon: Mail, label: 'Contact' },
  {
    path: '/admin',
    icon: Users,
    label: 'Admin',
    requiresAdmin: true,
    children: [
      { path: '/admin/users', icon: Users, label: 'Users', requiresAdmin: true },
      { path: '/admin/organizations', icon: Building2, label: 'Organizations', requiresAdmin: true },
    ],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const filteredNavigation = navigationItems.filter(item => {
    if (item.requiresAdmin && user?.role !== 'SUPERADMIN') {
      return false;
    }
    return true;
  });

  const renderNavItem = (
    item: NavItem,
    actionButton?: React.ReactNode
  ) => {
    const isActive = location.pathname === item.path;
    return (
      <div key={item.path} className="relative">
        <Link
          to={item.path}
          className={cn(
            'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
            isActive
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
              : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Link>
        {actionButton && (
          <div className="absolute top-0 right-0 h-full flex items-center pr-2">
            {actionButton}
          </div>
        )}
      </div>
    );
  };

  const renderSubNav = (item: NavItem) => {
    if (!item.children || item.children.length === 0) {
      return null;
    }

    return (
      <div key={item.path} className="mt-2 space-y-1 pl-2">
        {item.children.map(child => {
          if (child.requiresAdmin && user?.role !== 'SUPERADMIN') {
            return null;
          }
          const isActive = location.pathname === child.path;
          return (
            <Link
              key={child.path}
              to={child.path}
              className={cn(
                'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                isActive
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <child.icon className="h-4 w-4" />
              <span>{child.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  const handleAgentPlus = () => {
    setIsWizardOpen(true);
  };

  return (
    <>
      <div className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link to="/" className="font-bold text-lg text-slate-900 dark:text-slate-50">
            AI Platform
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map(item => {
            if (item.children) {
              return (
                <React.Fragment key={item.path}>
                  {renderNavItem(item)}
                  {renderSubNav(item)}
                </React.Fragment>
              );
            } else {
              return renderNavItem(item);
            }
          })}

          {/* Agents Section with Plus */}
          {renderNavItem(
            { 
              path: '/agents', 
              icon: Bot, 
              label: 'Agents',
              badge: user?.role === 'SUPERADMIN' ? undefined : undefined
            },
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={handleAgentPlus}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}

          {/* Separator */}
          <Separator className="my-4 dark:bg-slate-800" />

          {/* Documentation Link */}
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <BookOpen className="h-4 w-4" />
            <span>Documentation</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {user ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Logged in as {user.email}
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Agent Creation Wizard */}
      <AgentCreationWizard 
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
      />
    </>
  );
};

export default Sidebar;
