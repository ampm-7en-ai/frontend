
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Search, Plus } from 'lucide-react';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Link } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Label } from '@/components/ui/label';

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
  const { theme } = useAppTheme();

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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6 p-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">AI Agents</h1>
                <p className="text-slate-600 dark:text-slate-400 text-base">Manage and create your AI agents</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/agents/create">
                  <ModernButton variant="gradient" icon={Plus}>
                    Create Agent
                  </ModernButton>
                </Link>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search-agents" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Search Agents
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="search-agents"
                      placeholder="Search agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Model Filter */}
                <div className="space-y-2">
                  <Label htmlFor="model-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Filter by Model
                  </Label>
                  <Select value={modelFilter} onValueChange={setModelFilter}>
                    <SelectTrigger 
                      id="model-filter"
                      className="h-11 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <SelectValue placeholder="All Models" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                      <SelectItem value="all">All Models</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                      <SelectItem value="claude-3">Claude-3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            </div>

            {/* Agents Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Loading agents...</span>
                </div>
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
                <Link to="/agents/create">
                  <ModernButton variant="gradient" icon={Plus}>
                    Create Agent
                  </ModernButton>
                </Link>
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

export default AgentList;
