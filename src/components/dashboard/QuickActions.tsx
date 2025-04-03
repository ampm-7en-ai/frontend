
import React, { useEffect, useState } from 'react';
import { 
  PlusCircle, 
  Database, 
  Upload, 
  Bot, 
  BarChart2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';

type QuickActionsProps = {
  className?: string;
};

export function QuickActions({ className }: QuickActionsProps) {
  const [defaultAgentId, setDefaultAgentId] = useState("1");
  
  // Fetch first available agent ID for the "Test Agent" button
  const { data: agentsData } = useQuery({
    queryKey: ['quickactions-agents'],
    queryFn: async () => {
      console.log("QuickActions: Fetching agents for default ID");
      const token = getAccessToken();
      if (!token) return null;
      
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
          headers: getAuthHeaders(token)
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching agents for QuickActions:", error);
        return null;
      }
    },
    onSuccess: (data) => {
      if (data?.agents && data.agents.length > 0) {
        setDefaultAgentId(data.agents[0].id.toString());
        console.log("QuickActions: Setting default agent ID to:", data.agents[0].id);
      }
    }
  });

  const actions = [
    {
      icon: <PlusCircle size={16} />,
      label: 'Create Agent',
      href: '/agents/create',
      newTab: false
    },
    {
      icon: <Database size={16} />,
      label: 'Add Knowledge',
      href: '/knowledge/upload',
      newTab: false
    },
    {
      icon: <Upload size={16} />,
      label: 'Import Data',
      href: '/knowledge/upload',
      newTab: false
    },
    {
      icon: <Bot size={16} />,
      label: 'Test Agent',
      href: `/agents/${defaultAgentId}/test`, // Use dynamically fetched ID
      newTab: true
    },
    {
      icon: <BarChart2 size={16} />,
      label: 'View Reports',
      href: '/analytics',
      newTab: false
    },
  ];

  return (
    <div className={`card ${className}`}>
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 text-sm"
            asChild
          >
            <Link 
              to={action.href} 
              target={action.newTab ? "_blank" : undefined}
              rel={action.newTab ? "noopener noreferrer" : undefined}
            >
              {action.icon}
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
