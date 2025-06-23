
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
  PanelLeftClose
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
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  
  // Agent creation form state
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

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

  const handleAgentPlus = () => {
    setIsAgentDrawerOpen(true);
  };

  const handleAgentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(e.target.value);
    if (e.target.value.trim()) setNameError(false);
  };
  
  const handleAgentDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgentDescription(e.target.value);
    if (e.target.value.trim()) setDescriptionError(false);
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!agentName.trim()) {
      setNameError(true);
      isValid = false;
    }
    
    if (!agentDescription.trim()) {
      setDescriptionError(true);
      isValid = false;
    }
    
    if (!isValid) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields before creating an agent.",
        variant: "destructive"
      });
    }
    
    return isValid;
  };
  
  const handleSaveAgent = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting agent creation...");
    
    try {
      console.log("Sending agent creation request with:", { agentName, agentDescription });
      const data = await createAgent(agentName, agentDescription);
      
      console.log("Agent creation successful:", data);
      
      // Show success toast with message from response
      toast({
        title: "Agent Created Successfully",
        description: data.message || `${agentName} has been successfully created.`,
        variant: "default"
      });
      
      // Reset form and close drawer
      setAgentName('');
      setAgentDescription('');
      setNameError(false);
      setDescriptionError(false);
      setIsAgentDrawerOpen(false);
      
      // Navigate to agents page
      navigate('/agents');
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
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => 
                      `flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900`
                    }
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
                    {!isCollapsed && item.showPlusOnHover && item.plusAction && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          item.plusAction!();
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </nav>
        
        {/* User Profile */}
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

        {/* Sidebar Toggle at Bottom */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors mx-auto"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agent Creation Drawer */}
      <Drawer open={isAgentDrawerOpen} onOpenChange={setIsAgentDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Agent</DrawerTitle>
            <DrawerDescription>Configure your AI agent's basic information</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name" className="flex items-center">
                      Agent Name <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input 
                      id="agent-name" 
                      placeholder="e.g., Customer Support Assistant" 
                      value={agentName}
                      onChange={handleAgentNameChange}
                      className={nameError ? "border-destructive" : ""}
                      disabled={isSubmitting}
                    />
                    {nameError && (
                      <p className="text-destructive text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Agent name is required
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="agent-description" className="flex items-center">
                      Description <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Textarea 
                      id="agent-description" 
                      placeholder="Describe what this agent does and how it helps users"
                      className={`min-h-[100px] ${descriptionError ? "border-destructive" : ""}`}
                      value={agentDescription}
                      onChange={handleAgentDescriptionChange}
                      disabled={isSubmitting}
                    />
                    {descriptionError && (
                      <p className="text-destructive text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Agent description is required
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DrawerFooter>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground flex items-center">
                <span className="text-destructive mr-1">*</span> Required fields
              </p>
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
                <Button 
                  onClick={handleSaveAgent} 
                  disabled={isSubmitting || !agentName || !agentDescription}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Agent'
                  )}
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Sidebar;
