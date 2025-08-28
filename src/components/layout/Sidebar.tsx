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
  Search,
  ArrowRightFromLine,
  ArrowLeftFromLine,
  LogOut,
  CreditCard,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { NavLink, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, BASE_URL, getAccessToken } from '@/utils/api-config';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { createAgent } from '@/utils/api-config';
import { useAppTheme } from '@/hooks/useAppTheme';
import ModernButton from '../dashboard/ModernButton';
import { useQueryClient } from '@tanstack/react-query';
import { updateCachesAfterAgentCreation } from '@/utils/agentCacheUtils';
import AgentCreationWizard from '../agents/wizard/AgentCreationWizard';

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
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppTheme();
  const queryClient = useQueryClient();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isWizardOpen, setWizardOpen] = useState(false);
  
  // Check if we're on knowledge pages
  const isKnowledgePage = location.pathname.startsWith('/knowledge');
  
  console.log('Sidebar - isKnowledgePage:', isKnowledgePage, 'theme:', theme);

  // Toggle expand function
  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  // Handle knowledge plus action
  const handleKnowledgePlus = () => {
    navigate('/knowledge/upload');
  };

  // CACHE-FIRST: Handle agent plus action - create agent and redirect to builder
  const handleAgentPlus = async () => {    
    setWizardOpen(true);
  };

  const commonItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home, permission: 'dashboard' },
  ];

  const adminItems: SidebarItem[] = [
    { id: 'conversations', label: 'Conversations', href: '/conversations', icon: MessageSquare, permission: 'conversation' },
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
    { id: 'help', label: 'Help & Support', href: '#', icon: HelpCircle },
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
        // { label: 'Compliance', href: '/settings/platform/compliance',permission: 'dashboard' },
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

  const handlehelp = (href) => {
    window.open(href,'_blank');
  }

  return (
    <div className="relative flex">
      <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-[hsla(0,0%,0%,0.95)] dark:[background-image:radial-gradient(at_center_bottom,hsla(18,72%,55%,0.15)_0px,transparent_0%),radial-gradient(at_top_right,hsla(45,80%,55%,0.25)_0px,transparent_10%),radial-gradient(at_80%_0%,hsla(0,0%,0%,0.9)_0px,transparent_10%),radial-gradient(at_87%_5%,hsla(0,0%,0%,0.9)_0px,transparent_10%),radial-gradient(at_0%_100%,hsla(0,0%,0%,0.9)_0px,transparent_10%),radial-gradient(at_80%_100%,hsla(0,0%,0%,0.9)_0px,transparent_10%),radial-gradient(at_0%_0%,hsla(0,0%,0%,0.9)_0px,transparent_10%)] transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800 overflow-hidden`}>
        {/* Header with Logo */}
        <div className="flex items-center justify-between h-14 px-4">
          {!isCollapsed ? 
            theme === 'light' ? (<img src='/logo-new.svg' className="h-6" alt="Logo" />) : (<img src='/logo-white-new.svg' className="h-6" alt="Logo" />)
           : (
            theme === 'light' ? <img src='/logo-icon-new.svg' className="h-8 w-8" alt="Logo" /> : <img src='/logo-white-icon-new.svg' className="h-8 w-8" alt="Logo" />
          )}
        </div>
        
        {/* Search Bar */}
        {!isCollapsed && (<></>
          // <div className="p-4">
          //   <div className="relative">
          //     {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          //     <Input
          //       placeholder="Search Ctrl+K"
          //       value={searchQuery}
          //       onChange={(e) => setSearchQuery(e.target.value)}
          //       className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-0 focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-600 text-sm dark:text-gray-200 dark:placeholder-gray-400"
          //     /> */}
          //     <ModernButton
          //     variant="secondary"
          //     className="w-full"
          //     icon={Plus}>Create Agent</ModernButton>
          //   </div>
          // </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {filteredItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                    ${expandedItems.includes(item.id) ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`}
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
                          className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="relative group">
                  <NavLink
                    to={item.href}
                    onClick={item.id === "help" ? () => handlehelp("https://docs.7en.ai/") : null}
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors w-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <div className="flex items-center">
                      <item.icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 ${item.highlight ? 'text-green-600 dark:text-green-400' : ''}`} />
                      {!isCollapsed && (
                        <span className={`${item.highlight ? 'font-medium' : ''}`}>
                          {item.label}
                          {item.highlight && (
                            <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs py-0.5 px-1.5 rounded-full">
                              New
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    
                    {/* Plus icon for specific items */}
                    {!isCollapsed && item.showPlusOnHover && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 transition-opacity dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300"
                        disabled={isCreatingAgent && item.id === 'agents'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (item.plusAction) item.plusAction();
                        }}
                      >
                        {isCreatingAgent && item.id === 'agents' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </nav>
        
        {/* User Profile Section */}
        <div className="p-4">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8 bg-slate-300 dark:bg-slate-600 p-[1px]">
                      <AvatarFallback className="text-gray-500 text-sm font-medium bg-slate-100 dark:bg-slate-800">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 mb-2 p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                  <div className="flex-1 min-w-0 border-b border-gray-50 dark:border-gray-700 pb-4">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  {
                    userRole === 'USER' && (
                      <>
                        <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700"
                        onClick={() => navigate('/settings')}>
                          <User className="h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700"
                        onClick={() => navigate('/settings/business/payment-history')}>
                          <CreditCard className="h-4 w-4" />
                          Billing
                        </DropdownMenuItem>
                      </>
                    )
                  }
                  
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Theme toggle clicked, current theme:', theme);
                      toggleTheme();
                    }}
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Switch to Dark
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Switch to Light
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftFromLine className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-3 cursor-pointer rounded-lg p-2 transition-colors">
                      <Avatar className="h-8 w-8 bg-slate-300 dark:bg-slate-600 p-[1px]">
                        <AvatarFallback className="text-gray-500 text-sm font-medium bg-slate-100 dark:bg-slate-800">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 mb-2 p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                  <div className="flex-1 min-w-0 border-b border-gray-50 dark:border-gray-700 pb-4">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Theme toggle clicked, current theme:', theme);
                      toggleTheme();
                    }}
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Switch to Dark
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Switch to Light
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowRightFromLine className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <AgentCreationWizard
      open={isWizardOpen}
      onOpenChange={setWizardOpen}
      />
    </div>
  );
};

export default Sidebar;
