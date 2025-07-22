import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Plus } from 'lucide-react';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import AgentListFilters from '@/components/agents/AgentListFilters';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { transformAgentList } from '@/utils/agentTransformUtils';
import { updateCachesAfterAgentCreation } from '@/utils/agentCacheUtils';

const AgentListModern = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const { toast } = useToast();
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchAgents = async (): Promise<Agent[]> => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('🌐 AgentListModern: Fetching agents from API (cache miss)');
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('📊 AgentListModern: Raw API response structure:', {
      hasData: !!responseData.data,
      dataType: Array.isArray(responseData.data) ? 'Array' : typeof responseData.data,
      dataLength: Array.isArray(responseData.data) ? responseData.data.length : 'N/A'
    });
    
    // Use unified transformation
    const transformedAgents = transformAgentList(responseData);
    console.log('✅ AgentListModern: Final transformed agents:', transformedAgents.length, 'agents');
    
    return transformedAgents;
  };

  const { 
    data: agents = [],
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    // CACHE-FIRST: Optimized settings for better cache utilization
    staleTime: 30 * 1000, // 30 seconds - fresh enough for immediate use
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
    refetchOnWindowFocus: false, // Prevent unnecessary API calls
    refetchOnMount: false, // Use cache if available
    refetchInterval: false, // No automatic polling
    retry: 2
  });

  // Debug cache state
  useEffect(() => {
    const cacheData = queryClient.getQueryData(['agents']);
    console.log('🔍 AgentListModern mounted - cache data:', cacheData);
    console.log('📊 Current agents from query:', agents);
    console.log('💾 Cache hit status:', cacheData ? 'CACHE HIT' : 'CACHE MISS');
  }, [queryClient, agents]);

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

  // CACHE-FIRST: Remove unnecessary refetch after delete
  const handleDeleteAgent = async (_agentId: string) => {
    // Only refresh if cache is stale or we specifically need to
    const cacheData = queryClient.getQueryData(['agents']);
    if (!cacheData) {
      console.log('🔄 Cache empty after delete, refreshing...');
      refetch();
    }
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
      console.log('🚀 AgentListModern: Creating new agent (CACHE-FIRST)...');
      
      // API call - this should be the ONLY network request
      const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          name: `New Agent ${Date.now()}`,
          description: 'A new AI agent ready to be configured.',
        })
      });
      
      const data = await response.json();
      console.log('📦 AgentListModern: Creation API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create agent');
      }
      
      // CACHE-FIRST: Update cache immediately, no additional API calls
      if (data.data) {
        console.log('🔄 AgentListModern: Updating caches (CACHE-FIRST)');
        updateCachesAfterAgentCreation(queryClient, data);
        
        // Verify cache update worked
        setTimeout(() => {
          const updatedCache = queryClient.getQueryData(['agents']);
          console.log('🔍 AgentListModern: Post-update cache verification:');
          console.log('  - Type:', Array.isArray(updatedCache) ? 'Array' : typeof updatedCache);
          console.log('  - Length:', Array.isArray(updatedCache) ? updatedCache.length : 'N/A');
          console.log('  - Contains new agent:', Array.isArray(updatedCache) ? 
            updatedCache.some(a => a.id === data.data.id.toString()) : 'N/A');
          console.log('  - Cache update successful:', Array.isArray(updatedCache) && 
            updatedCache.some(a => a.id === data.data.id.toString()) ? '✅' : '❌');
        }, 100);
      }
      
      toast({
        title: "Agent Created",
        description: data.message || "New agent has been created successfully.",
        variant: "default"
      });
      
      if (data.data?.id) {
        console.log('🧭 AgentListModern: Navigating to builder:', data.data.id);
        navigate(`/agents/builder/${data.data.id}`);
      } else {
        navigate('/agents/builder');
      }
    } catch (error) {
      console.error('❌ AgentListModern: Creation failed:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  console.log('🎨 AgentListModern render - agents:', agents.length, 'filtered:', filteredAgents.length);
  console.log('💾 Render cache status:', agents.length > 0 ? 'USING CACHE' : 'LOADING/EMPTY');

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
