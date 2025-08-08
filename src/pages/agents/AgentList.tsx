import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Search, Plus } from 'lucide-react';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Label } from '@/components/ui/label';
import { transformAgentList } from '@/utils/agentTransformUtils';
import { updateCachesAfterAgentCreation } from '@/utils/agentCacheUtils';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchAgents = async (): Promise<Agent[]> => {
    const token = getAccessToken();
    console.log('🔍 AgentList: Fetching agents with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.error('❌ No authentication token found for agent fetch');
      throw new Error('Authentication required');
    }
    
    console.log('🌐 AgentList: Fetching from API (cache miss):', getApiUrl(API_ENDPOINTS.AGENTS));
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
      headers: getAuthHeaders(token)
    });
    
    console.log('📡 Agent fetch response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch agents: ${response.status}`, errorText);
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('📊 Raw API response structure:', {
      hasData: !!responseData.data,
      dataType: Array.isArray(responseData.data) ? 'Array' : typeof responseData.data,
      dataLength: Array.isArray(responseData.data) ? responseData.data.length : 'N/A'
    });
    
    // Use unified transformation
    const transformedAgents = transformAgentList(responseData);
    console.log('✅ Final transformed agents:', transformedAgents.length, 'agents');
    
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

  // Debug cache state on component mount
  useEffect(() => {
    const cacheData = queryClient.getQueryData(['agents']);
    console.log('🔍 AgentList mounted - current cache data:', cacheData);
    console.log('📊 Current agents from query:', agents);
    console.log('💾 Cache hit status:', cacheData ? 'CACHE HIT' : 'CACHE MISS');
  }, [queryClient, agents]);

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching agents:', error);
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

  // CACHE-FIRST: Only refresh if cache is actually empty
  const handleDeleteAgent = async (_agentId: string) => {
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
      console.log('🚀 AgentList: Starting agent creation (CACHE-FIRST)...');
      
      // API call - this should be the ONLY network request
      const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          name: `Untitled Agent`,
          description: 'A new AI agent ready to be configured.',
        })
      });
      
      const data = await response.json();
      console.log('📦 Agent creation API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create agent');
      }
      
      // CACHE-FIRST: Update cache immediately, no additional API calls
      if (data.data) {
        console.log('🔄 AgentList: Updating caches (CACHE-FIRST)');
        updateCachesAfterAgentCreation(queryClient, data);
        
        // Verify cache update
        setTimeout(() => {
          const updatedCache = queryClient.getQueryData(['agents']);
          console.log('🔍 AgentList: Post-update cache verification:');
          console.log('  - Type:', Array.isArray(updatedCache) ? 'Array' : typeof updatedCache);
          console.log('  - Length:', Array.isArray(updatedCache) ? updatedCache.length : 'N/A');
          console.log('  - Contains new agent:', Array.isArray(updatedCache) ? 
            updatedCache.some(a => a.id === data.data.id.toString()) : 'N/A');
          console.log('  - Cache update successful:', Array.isArray(updatedCache) && 
            updatedCache.some(a => a.id === data.data.id.toString()) ? '✅' : '❌');
        }, 100);
      } else {
        console.warn('⚠️ No data.data in response, cache not updated');
      }
      
      toast({
        title: "Agent Created",
        description: data.message || "New agent has been created successfully.",
        variant: "default"
      });
      
      // Navigate to builder
      if (data.data?.id) {
        console.log('🧭 Navigating to builder with agent ID:', data.data.id);
        navigate(`/agents/builder/${data.data.id}`);
      } else {
        navigate('/agents/builder');
      }
    } catch (error) {
      console.error('❌ Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  console.log('🎨 AgentList render - agents count:', agents.length, 'filtered:', filteredAgents.length);
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

export default AgentList;
