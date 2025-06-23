
import React, { useEffect, useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Settings,
  Building,
  MessageSquare,
  Bot,
  Book,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  BarChart2,
  Users,
  Upload,
  ExternalLink,
  Palette,
  Plus,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Link,
  Search
} from 'lucide-react';
import { NavLink, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, BASE_URL, getAccessToken } from '@/utils/api-config';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const UserPermissions = {
  conversation: 'conversation',
  knowledgebase: 'knowledgebase',
  agents: 'agents',
  settings: 'settings',
  dashboard: 'dashboard',
  superadmin: 'superadmin',
  integrations: 'integrations'
} as const;

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string, permission?: keyof typeof UserPermissions }[];
  action?: React.ReactNode;
  permission?: keyof typeof UserPermissions;
  highlight?: boolean;
  showPlusOnHover?: boolean;
  plusAction?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [agentPopoverOpen, setAgentPopoverOpen] = useState(false);

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  const handleKnowledgePlus = () => {
    navigate('/knowledge/upload');
  };

  const handleAgentPlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAgentPopoverOpen(true);
  };

  const commonItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home, permission: 'dashboard' },
  ];

  const adminItems: SidebarItem[] = [
    { id: 'conversations', label: 'Chat', href: '/conversations', icon: MessageSquare, permission: 'conversation' },
    { 
      id: 'agents', 
      label: 'AI Agents', 
      href: '/agents', 
      icon: Bot, 
      permission: 'agents',
      showPlusOnHover: true,
      plusAction: handleAgentPlus
    },
    { 
      id: 'knowledge', 
      label: 'Knowledge', 
      href: '/knowledge', 
      icon: Book, 
      permission: 'knowledgebase',
      showPlusOnHover: true,
      plusAction: handleKnowledgePlus
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      href: '/integrations', 
      icon: Link, 
      permission: 'settings',
      highlight: true 
    },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, permission: 'settings' },
    { id: 'help', label: 'Help & Support', href: '/help/support', icon: HelpCircle },
  ];

  const superAdminItems: SidebarItem[] = [
    { 
      id: 'business-management',
      label: 'Businesses', 
      href: '/businesses', 
      icon: Building,
      permission: 'dashboard'
    },
    { 
      id: 'platform',
      label: 'Platform Settings', 
      href: '/settings', 
      icon: LayoutDashboard,
      permission: 'dashboard', 
      children: [
        { label: 'General', href: '/settings/platform/general',permission: 'dashboard' },
        { label: 'Security', href: '/settings/platform/security',permission: 'dashboard' },
        { label: 'LLM Providers', href: '/settings/platform/llm-providers',permission: 'dashboard' },
        { label: 'Compliance', href: '/settings/platform/compliance',permission: 'dashboard' },
        { label: 'Billing & Subscriptions', href: '/settings/platform/billing',permission: 'dashboard' },
        { label: 'Customization', href: '/settings/platform/customization',permission: 'dashboard' },
      ]
    },
  ];

  const roleBasedItems = userRole === "SUPERADMIN" 
    ? [...superAdminItems] 
    : adminItems;

  const userPermissions = JSON.parse(localStorage.getItem('user'))?.permission || {};

  const filteredRoleBasedItems = roleBasedItems.filter(item => !item.permission || userPermissions[item.permission]).map(item => ({
    ...item,
    children: item.children?.filter(child => !child.permission || userPermissions[child.permission]) 
  }));

  // Filter items based on search query
  const filteredItems = [...commonItems, ...filteredRoleBasedItems].filter(item => 
    searchQuery === '' || 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.children && item.children.some(child => 
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  return (
    <div className="relative flex">
      <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'} bg-white transition-all duration-300 ease-in-out border-r border-gray-100 overflow-hidden`}>
        {/* Header with Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          {!isCollapsed ? (
            <img src='/logo.svg' className="h-8" alt="Logo" />
          ) : (
            <img src='/logo-icon.svg' className="h-8 w-8" alt="Logo" />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Ctrl+K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-gray-200 text-sm"
              />
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                    ${expandedItems.includes(item.id) ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    onClick={() => !isCollapsed && toggleExpand(item.id)}
                  >
                    <div className="flex items-center">
                      <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      expandedItems.includes(item.id) ? 
                        <ChevronDown className="w-4 h-4" /> :
                        <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {!isCollapsed && expandedItems.includes(item.id) && item.children && (
                    <div className="mt-1 space-y-1 pl-7">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.label}
                          to={child.href}
                          className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="relative group">
                  {item.showPlusOnHover && item.id === 'agents' ? (
                    <Popover open={agentPopoverOpen} onOpenChange={setAgentPopoverOpen}>
                      <div className="flex items-center">
                        <NavLink
                          to={item.href}
                          className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 ${item.highlight ? 'text-green-600' : ''}`} />
                          {!isCollapsed && (
                            <span className={`${item.highlight ? 'font-medium' : ''}`}>
                              {item.label}
                              {item.highlight && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs py-0.5 px-1.5 rounded-full">
                                  New
                                </span>
                              )}
                            </span>
                          )}
                        </NavLink>
                        {!isCollapsed && item.showPlusOnHover && (
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                              onClick={handleAgentPlus}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                        )}
                      </div>
                      <PopoverContent className="w-56 p-2" align="start" side="right">
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-8 px-2 text-sm"
                            onClick={() => {
                              navigate('/agents/create');
                              setAgentPopoverOpen(false);
                            }}
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            Create Agent
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-8 px-2 text-sm"
                            onClick={() => {
                              navigate('/agents/import');
                              setAgentPopoverOpen(false);
                            }}
                          >
                            <Upload className="mr-2 h-3 w-3" />
                            Import Agent
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex items-center">
                      <NavLink
                        to={item.href}
                        className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 ${item.highlight ? 'text-green-600' : ''}`} />
                        {!isCollapsed && (
                          <span className={`${item.highlight ? 'font-medium' : ''}`}>
                            {item.label}
                            {item.highlight && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs py-0.5 px-1.5 rounded-full">
                                New
                              </span>
                            )}
                          </span>
                        )}
                      </NavLink>
                      {!isCollapsed && item.showPlusOnHover && item.plusAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                          onClick={item.plusAction}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
        
        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-gray-100">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 bg-gray-900">
                <AvatarFallback className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-8 w-8 bg-gray-900">
                <AvatarFallback className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
