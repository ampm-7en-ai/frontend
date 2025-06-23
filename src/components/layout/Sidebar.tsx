
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
  User
} from 'lucide-react';
import { NavLink, Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createAgent } from '@/utils/api-config';

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
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Agent creation form state
  const [agentName, setAgentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);

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

  const handleAgentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(e.target.value);
    if (e.target.value.trim()) setNameError(false);
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!agentName.trim()) {
      setNameError(true);
      isValid = false;
    }
    
    if (!isValid) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter an agent name.",
        variant: "destructive"
      });
    }
    
    return isValid;
  };
  
  const handleCreateAgent = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting agent creation...");
    
    try {
      console.log("Sending agent creation request with:", { agentName });
      const data = await createAgent(agentName, `AI Agent: ${agentName}`);
      
      console.log("Agent creation successful:", data);
      
      // Show success toast with message from response
      toast({
        title: "Agent Created Successfully",
        description: data.message || `${agentName} has been successfully created.`,
        variant: "default"
      });
      
      // Reset form and close dropdown
      setAgentName('');
      setNameError(false);
      setIsAgentDropdownOpen(false);
      
      // Navigate to agent edit page with the new agent id
      if (data.data?.id) {
        navigate(`/agents/${data.data.id}/edit`);
      } else {
        navigate('/agents');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while creating the agent.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
      showPlusOnHover: true
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
        <div className="flex items-center justify-between h-14 px-4">
          {!isCollapsed ? (
            <img src='/logo.svg' className="h-8" alt="Logo" />
          ) : (
            <img src='/logo-icon.svg' className="h-8 w-8" alt="Logo" />
          )}
        </div>
        
        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-4">
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
                  <NavLink
                    to={item.href}
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center">
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
                    </div>
                    
                    {/* Plus icon for specific items */}
                    {!isCollapsed && item.showPlusOnHover && (
                      <>
                        {item.id === 'agents' ? (
                          <DropdownMenu open={isAgentDropdownOpen} onOpenChange={setIsAgentDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[280px] p-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bot className="h-5 w-5" />
                                  <h3 className="text-sm font-semibold">Create New Agent</h3>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="agentName" className="text-xs">Agent Name</Label>
                                  <Input
                                    id="agentName"
                                    placeholder="Enter agent name"
                                    value={agentName}
                                    onChange={handleAgentNameChange}
                                    className={`h-8 text-sm ${nameError ? "border-red-500" : ""}`}
                                    disabled={isSubmitting}
                                  />
                                  {nameError && (
                                    <p className="text-xs text-red-500 flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Please enter an agent name
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  onClick={handleCreateAgent} 
                                  className="w-full h-8 text-sm"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Creating...
                                    </>
                                  ) : (
                                    "Create Agent"
                                  )}
                                </Button>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (item.plusAction) item.plusAction();
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </>
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
                  <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8 bg-gray-300 p-[1px]">
                      <AvatarFallback className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 mb-2 p-4">
                  <div className="flex-1 min-w-0 border-b border-gray-50 pb-4">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
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
                className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftFromLine className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <Avatar className="h-8 w-8 bg-gray-300 p-[1px]">
                        <AvatarFallback className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 mb-2 p-4">
                  <div className="flex-1 min-w-0 border-b border-gray-50 pb-4">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
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
                className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowRightFromLine className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
