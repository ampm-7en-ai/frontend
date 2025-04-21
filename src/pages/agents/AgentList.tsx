
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Search } from 'lucide-react';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ApiResponse {
  agents: any[];
  combined_satisfaction: number;
  metadata: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    filters: {
      model: string;
      status: string;
      role: string;
    };
    sort: {
      field: string;
      direction: string;
    };
  };
}

const AgentList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const { toast } = useToast();

  const fetchAgents = async (): Promise<Agent[]> => {
    const token = getAccessToken();
    console.log('Fetching agents with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.error('No authentication token found for agent fetch');
      throw new Error('Authentication required');
    }
    
    console.log('Fetching agents from:', getApiUrl(API_ENDPOINTS.AGENTS));
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      headers: getAuthHeaders(token)
    });
    
    console.log('Agent fetch response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch agents: ${response.status}`, errorText);
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Agent data received:', responseData);
    
    if (!responseData.data) {
      console.error('Invalid response format, missing data property:', responseData);
      return [];
    }
    
    return responseData.data.map((agent: any) => ({
      id: agent.id.toString(),
      name: agent.name,
      description: agent.description || '',
      conversations: agent.conversations || 0,
      lastModified: agent.last_modified,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3
  });

  // Fetch agents on component mount
  useEffect(() => {
    console.log('AgentList component mounted, fetching agents...');
    refetch();
  }, [refetch]);

  // Move the error toast to useEffect to prevent render-time state updates
  useEffect(() => {
    if (error) {
      console.error('Error fetching agents:', error);
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
    // We just refetch to refresh the list. (Better than filtering locally unless you want instant feedback)
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-muted-foreground">Manage and create your AI agents</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select 
            value={modelFilter} 
            onValueChange={setModelFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              <SelectItem value="claude-3">Claude-3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner text="Loading agents..." />
        </div>
      ) : (
        <>
          {filteredAgents.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <Bot size={40} className="mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No agents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || modelFilter !== 'all' 
                  ? "Try adjusting your search filters"
                  : "Create your first AI agent to get started"}
              </p>
              <Button>Create Agent</Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        </>
      )}
    </div>
  );
};

export default AgentList;
