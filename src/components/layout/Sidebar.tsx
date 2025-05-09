
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
  Link
} from 'lucide-react';
import { NavLink, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, BASE_URL, getAccessToken } from '@/utils/api-config';

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
}


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [agentNameError, setAgentNameError] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [loginUser,setLoginUser] = useState({});

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) {
      setAgentNameError(true);
      return;
    }
    
    setAgentNameError(false);
    setIsCreatingAgent(true);
    
    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an agent.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAgentName,
          description: `Quick agent created from sidebar: ${newAgentName}`,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error.message || 'Failed to create agent');
      }
      
      toast({
        title: "Agent Created",
        description: data.data.message || `${newAgentName} has been successfully created.`,
        variant: "default"
      });
      
      setNewAgentName('');
      // Navigate to the edit page for the newly created agent if the id is present
      if (data.data.id) {
        navigate(`/agents/${data.data.id}/edit`);
      } else {
        navigate('/agents');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAgent(false);
    }
  }; 


   

  const commonItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home, permission: 'dashboard' },
  ];

  const adminItems: SidebarItem[] = [
    { id: 'conversations', label: 'Conversations', href: '/conversations', icon: MessageSquare, permission: 'conversation' },
    { id: 'agents', label: 'Agents', href: '/agents',  icon: Bot, permission: 'agents' },
    { id: 'knowledge', label: 'Knowledge Base', href: '/knowledge', icon: Book, permission: 'knowledgebase' },
    { id: 'integrations', label: 'Integrations', href: '/integrations', icon: Link, permission: 'integrations' },
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

  const roleBasedItems = userRole === "superadmin" 
    ? [...superAdminItems] 
    : adminItems;

  const userPermissions = JSON.parse(localStorage.getItem('user'))?.permission || {};

  //Filtering rolesBasedItems with permsision
  const filteredRoleBasedItems = roleBasedItems.filter(item => !item.permission || userPermissions[item.permission]).map(item => ({
    ...item,
    children: item.children?.filter(child => !child.permission || userPermissions[child.permission]    ) 
  }))

  return (
    <div className="relative flex">
      <div className="absolute -right-3 top-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-6 w-6 rounded-full bg-white shadow-md hover:bg-accent transition-all duration-300"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-72'} bg-white transition-all duration-300 ease-in-out shadow-sm overflow-hidden`}>
        <div className="flex items-center h-16 px-4 mb-4">
          {!isCollapsed ? (
            <span className="text-lg font-bold text-primary">7en.ai</span>
          ) : (
            <span className="text-lg font-bold text-primary mx-auto">7</span>
          )}
        </div>
        
        <div className="px-3 py-2 mb-4">
          {!isCollapsed ? (
            <div className="flex items-center px-2">
              <Avatar className="h-10 w-10 bg-primary/90 text-gray-400 p-[1px]">
                <AvatarFallback className="text-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-black leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-dark-gray">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-10 w-10 bg-primary/90 text-white">
                <AvatarFallback className="text-sm">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
          <div className="space-y-1">
            {commonItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-3 text-sm rounded-lg
                  ${isActive ? 'bg-accent text-primary font-medium shadow-sm' : 'text-black hover:bg-secondary'}`
                }
              >
                <item.icon className={`w-4.5 h-4.5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </NavLink>
            ))}
          </div>
          
          {filteredRoleBasedItems.length > 0 && (
            <div className="pt-4">
              {!isCollapsed && (
                <div className="text-xs font-semibold text-dark-gray uppercase px-3 mb-2">
                  {userRole === "superadmin" ? "ADMINISTRATION" : "BUSINESS"}
                </div>
              )}
              <div className="space-y-1">
                {filteredRoleBasedItems.map((item) => (
                  <div key={item.id}>
                    {item.children ? (
                      <>
                        <button
                          className={`w-full flex items-center justify-between px-3.5 py-3 text-sm rounded-lg h-auto 
                          ${expandedItems.includes(item.id) ? 'bg-accent text-primary font-medium shadow-sm' : 'text-black hover:bg-secondary'}`}
                          onClick={() => !isCollapsed && toggleExpand(item.id)}
                        >
                          <div className="flex items-center">
                            <item.icon className={`w-4.5 h-4.5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                            {!isCollapsed && <span className="text-sm">{item.label}</span>}
                          </div>
                          {!isCollapsed && (
                            expandedItems.includes(item.id) ? 
                              <ChevronDown className="w-4 h-4" /> :
                              <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        {!isCollapsed && expandedItems.includes(item.id) && item.children && (
                          <div className="mt-1 space-y-1 pl-10">
                            {item.children.map((child) => (
                              <NavLink
                                key={child.label}
                                to={child.href}
                                className={({ isActive }) =>
                                  `flex items-center px-3 py-2.5 text-sm rounded-lg
                                  ${isActive ? 'bg-accent text-primary font-medium shadow-sm' : 'text-black hover:bg-secondary'}`
                                }
                              >
                                <span className="text-sm">{child.label}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center">
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center px-3.5 py-3 text-sm rounded-lg
                            ${isActive ? 'bg-accent text-primary font-medium shadow-sm' : 'text-black hover:bg-secondary'}
                            w-full`
                          }
                        >
                          <item.icon className={`w-4.5 h-4.5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                          {!isCollapsed && <span className="text-sm">{item.label}</span>}
                        </NavLink>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
