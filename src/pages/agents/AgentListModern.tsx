
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Plus } from 'lucide-react';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import AgentListFilters from '@/components/agents/AgentListFilters';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAppTheme } from '@/hooks/useAppTheme';

const AgentListModern = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const { toast } = useToast();
  const { theme } = useAppTheme();
  const navigate = useNavigate();

  const fetchAgents = async (): Promise<Agent[]> => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.data) {
      return [];
    }
    
    return responseData.data.map((agent: any) => ({
      id: agent.id.toString(),
      name: agent.name,
      description: agent.description || '',
      conversations: agent.conversations || 0,
      lastModified: agent.created_at,
      averageRating: agent.average_rating || 0,
      knowledgeSources: agent.knowledge_bases?.map((kb: any, index: number) => ({
        id: kb.id || index,
        name: kb.name || `Source ${index + 1}`,
        type: kb.type || 'document',
        icon: 'BookOpen',
        hasError: kb.status === 'deleted',
        hasIssue: kb.status === 'issues'
      })) || [],
      model: agent.model?.selectedModel || agent.model?.name || 'gpt-3.5',
      isDeployed: agent.status === 'Live',
      status: agent.status || 'Draft'
    }));
  };

  const { 
    data: agents = [],
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    staleTime: 2 * 60 * 1000, // 2 minutes - longer stale time for agent list
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Disable for agent list to prevent excessive calls
    refetchOnMount: false, // Disable to prevent refetch every time
    retry: 2
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching agents",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const { 
    filteredAgents, 
    getModelBadgeColor,
    getStatusBadgeColor
  } = useAgentFiltering({
    agents,
    searchQuery,
    modelFilter,
    setSearchQuery,
    setModelFilter
  });

  const handleDeleteAgent = async (_agentId: string) => {
    refetch();
  };

  const handleCreateAgent = async () => {
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
      const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          name: `New Agent ${Date.now()}`,
          description: 'A new AI agent ready to be configured.',
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create agent');
      }
      
      toast({
        title: "Agent Created",
        description: data.data?.message || "New agent has been created successfully.",
        variant: "default"
      });
      
      if (data.data?.id) {
        navigate(`/agents/builder/${data.data.id}`);
      } else {
        navigate('/agents/builder');
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6 p-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">AI Agents</h1>
                <p className="text-slate-600 dark:text-slate-400 text-base">Manage and create your AI agents</p>
              </div>
              <div className="flex items-center gap-3">
                <ModernButton variant="gradient" icon={Plus} onClick={handleCreateAgent}>
                  Create Agent
                </ModernButton>
              </div>
            </div>

            {/* Search and Filter Section */}
            <AgentListFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              modelFilter={modelFilter}
              setModelFilter={setModelFilter}
            />

            {/* Agents Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" text="Loading agents..." />
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full mb-6">
                  <Bot className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No agents found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
                  {searchQuery || modelFilter !== 'all' 
                    ? "Try adjusting your search filters"
                    : "Create your first AI agent to get started"}
                </p>
                <ModernButton variant="gradient" icon={Plus} onClick={handleCreateAgent}>
                  Create Agent
                </ModernButton>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAgents.map((agent) => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent}
                    getModelBadgeColor={getModelBadgeColor}
                    getStatusBadgeColor={getStatusBadgeColor}
                    onDelete={handleDeleteAgent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentListModern;
