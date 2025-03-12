
import React, { useState } from 'react';
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
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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

interface SidebarProps {
  isCollapsed: boolean;
}

// Define an interface for the sidebar items
interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
  action?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userRole = user?.role;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [agentNameError, setAgentNameError] = useState(false);

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) {
      setAgentNameError(true);
      return;
    }
    
    setAgentNameError(false);
    // Logic to create the agent would go here
    toast({
      title: "Agent Created",
      description: `${newAgentName} has been successfully created.`,
      variant: "default"
    });
    
    setNewAgentName('');
    navigate('/agents');
  };

  const commonItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home },
  ];

  const adminItems: SidebarItem[] = [
    { id: 'conversations', label: 'Conversations', href: '/conversations', icon: MessageSquare },
    { 
      id: 'agents', 
      label: 'Agents', 
      href: '/agents', 
      icon: Bot,
      action: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-accent hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-3">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Create New Agent</h4>
                <p className="text-xs text-muted-foreground mt-1">Enter a name for your new agent</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="text-xs">Agent Name</Label>
                <Input 
                  id="agent-name" 
                  value={newAgentName} 
                  onChange={(e) => {
                    setNewAgentName(e.target.value);
                    if (e.target.value.trim()) setAgentNameError(false);
                  }}
                  placeholder="e.g., Customer Support Bot" 
                  className={agentNameError ? "border-destructive" : ""}
                />
                {agentNameError && (
                  <p className="text-destructive text-xs">Agent name is required</p>
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateAgent}
                disabled={!newAgentName.trim()}
              >
                Create Agent
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    { id: 'knowledge', label: 'Knowledge Base', href: '/knowledge', icon: Book },
    { id: 'business-settings', label: 'Business Settings', href: '/settings', icon: Settings, children: [
      { label: 'Business Profile', href: '/settings/business/profile' },
      { label: 'Team Management', href: '/settings/business/team' },
      { label: 'Agent Settings', href: '/settings/business/agents' },
      { label: 'Integrations', href: '/settings/business/integrations' },
      { label: 'Billing', href: '/settings/business/billing' },
      { label: 'Preferences', href: '/settings/business/preferences' },
    ] },
    { id: 'help', label: 'Help & Support', href: '/help/support', icon: HelpCircle },
  ];

  const superAdminItems: SidebarItem[] = [
    { 
      id: 'business-management',
      label: 'Businesses', 
      href: '/businesses', 
      icon: Building
    },
    {
      id: 'user-management',
      label: 'Domain Experts',
      href: '/users',
      icon: Users
    },
    { 
      id: 'platform-analytics',
      label: 'Platform Analytics', 
      href: '/analytics', 
      icon: BarChart2 
    },
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
        { label: 'Billing & Subscriptions', href: '/settings/platform/billing' },
        { label: 'Customization', href: '/settings/platform/customization' },
      ]
    },
  ];

  const roleBasedItems = userRole === "superadmin" 
    ? [...superAdminItems] 
    : adminItems;

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-medium-gray/10 transition-all duration-300 ease-in-out shadow-sm overflow-hidden`}>
      <div className="flex items-center h-16 px-4 border-b border-medium-gray/10">
        {!isCollapsed ? (
          <span className="text-lg font-bold text-primary">7en.ai</span>
        ) : (
          <span className="text-lg font-bold text-primary mx-auto">7</span>
        )}
      </div>
      
      <div className="px-3 py-4 border-b border-medium-gray/10">
        {!isCollapsed ? (
          <div className="flex items-center px-2">
            <Avatar className="h-10 w-10 bg-primary/90 text-white">
              <AvatarFallback className="text-sm">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
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
      
      <nav className="flex-1 px-3 py-6 space-y-4 overflow-y-auto">
        <div className="space-y-1.5">
          {commonItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3.5 text-sm rounded-md
                ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
              }
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </div>
        
        {roleBasedItems.length > 0 && (
          <div className="pt-6">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-dark-gray uppercase px-3 mb-3">
                {userRole === "superadmin" ? "ADMINISTRATION" : "BUSINESS"}
              </div>
            )}
            <div className="space-y-1.5">
              {roleBasedItems.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <>
                      <button
                        className={`w-full flex items-center justify-between px-4 py-3.5 text-sm rounded-md h-auto 
                        ${expandedItems.includes(item.id) ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`}
                        onClick={() => !isCollapsed && toggleExpand(item.id)}
                      >
                        <div className="flex items-center">
                          <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
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
                    <div className="flex items-center justify-between">
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3.5 text-sm rounded-md flex-grow
                          ${isActive ? 'bg-accent text-primary font-medium' : 'text-black hover:bg-secondary'}`
                        }
                      >
                        <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between flex-grow">
                            <span className="text-sm">{item.label}</span>
                            {item.action}
                          </div>
                        )}
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
  );
};

export default Sidebar;
