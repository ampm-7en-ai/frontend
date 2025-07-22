
import { Agent } from '@/hooks/useAgentFiltering';
import { transformAgentCreationResponse, transformAgentData } from './agentTransformUtils';

// Transform API response data to match Agent interface (deprecated - use unified transform)
export const transformAgentResponse = (apiAgent: any): Agent => {
  console.log('🔄 Transforming agent response (deprecated - use unified transform):', apiAgent);
  return transformAgentData(apiAgent);
};

// Add new agent to existing cache with proper structure validation
export const addAgentToCache = (queryClient: any, newAgent: Agent) => {
  console.log('🏪 Adding agent to cache with key: ["agents"]');
  console.log('📦 Agent data to add:', newAgent);
  
  // Get current cache data to inspect structure
  const currentData = queryClient.getQueryData(['agents']);
  console.log('📋 Current agents cache data:', currentData);
  console.log('📊 Current cache data type:', Array.isArray(currentData) ? 'Array' : typeof currentData);
  
  queryClient.setQueryData(['agents'], (oldData: Agent[] | undefined) => {
    console.log('🔄 Cache update function called with oldData:', oldData);
    console.log('🔍 oldData type:', Array.isArray(oldData) ? 'Array' : typeof oldData);
    console.log('🔍 oldData length:', Array.isArray(oldData) ? oldData.length : 'N/A');
    
    if (!oldData || !Array.isArray(oldData)) {
      console.log('✨ No existing array data, creating new array with agent');
      return [newAgent];
    }
    
    // Check if agent already exists (prevent duplicates)
    const existingIndex = oldData.findIndex(agent => agent.id === newAgent.id);
    if (existingIndex !== -1) {
      console.log('🔄 Agent exists at index:', existingIndex, '- updating');
      // Update existing agent
      const updatedData = [...oldData];
      updatedData[existingIndex] = newAgent;
      console.log('✅ Updated agents array length:', updatedData.length);
      return updatedData;
    }
    
    // Add new agent to the beginning of the list
    console.log('➕ Adding new agent to beginning of list');
    const newData = [newAgent, ...oldData];
    console.log('✅ New agents array length:', newData.length);
    console.log('🔍 First 3 agent IDs:', newData.slice(0, 3).map(a => a.id));
    return newData;
  });
  
  // Verify the cache was updated
  const updatedData = queryClient.getQueryData(['agents']);
  console.log('✅ Cache verification - data type:', Array.isArray(updatedData) ? 'Array' : typeof updatedData);
  console.log('✅ Cache verification - length:', Array.isArray(updatedData) ? updatedData.length : 'N/A');
  
  // CACHE-FIRST: Only notify components about cache changes, no API refetch
  console.log('🔔 Notifying components of cache update (no API call)');
  queryClient.invalidateQueries({ 
    queryKey: ['agents'],
    exact: true,
    refetchType: 'none' // Critical: prevents API call, only notifies components
  });
};

// Transform knowledge folder API response to match expected format
export const transformKnowledgeFolderResponse = (apiResponse: any) => {
  if (!apiResponse.data) return null;
  
  return {
    id: apiResponse.data.folder_id,
    agent: apiResponse.data.folder_id,
    name: apiResponse.data.folder_name,
    description: '',
    source_count: apiResponse.data.knowledge_sources?.length || 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_sources: apiResponse.data.knowledge_sources || []
  };
};

// Add knowledge folder to cache from agent creation
export const addKnowledgeFolderToCache = (queryClient: any, agentData: any) => {
  console.log('🗂️ Adding knowledge folder to cache for agent:', agentData.id);
  
  queryClient.setQueryData(['knowledgeFolders'], (oldData: any) => {
    console.log('📁 Current knowledge folders cache:', oldData);
    
    if (!oldData || !oldData.data) return oldData;
    
    const newFolder = {
      id: agentData.id,
      agent: agentData.id,
      name: agentData.name,
      description: agentData.description,
      source_count: 0,
      status: 'active',
      created_at: agentData.created_at,
      updated_at: agentData.updated_at
    };
    
    console.log('📁 Adding new folder:', newFolder);
    
    const updatedData = {
      ...oldData,
      data: [newFolder, ...oldData.data]
    };
    
    console.log('✅ Updated knowledge folders cache:', updatedData);
    return updatedData;
  });
  
  // CACHE-FIRST: Notify without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['knowledgeFolders'],
    refetchType: 'none'
  });
};

// Update knowledge folder cache with detailed data from knowledge folder API
export const updateKnowledgeFolderWithDetails = (queryClient: any, agentId: string, folderResponse: any) => {
  console.log('🔄 Updating knowledge folder with details for agent:', agentId);
  console.log('📁 Folder response:', folderResponse);
  
  const transformedFolder = transformKnowledgeFolderResponse(folderResponse);
  if (!transformedFolder) {
    console.log('❌ No transformed folder data');
    return;
  }

  console.log('✅ Transformed folder:', transformedFolder);

  queryClient.setQueryData(['knowledgeFolders'], (oldData: any) => {
    if (!oldData || !oldData.data) return oldData;
    
    const updatedData = [...oldData.data];
    const existingIndex = updatedData.findIndex(folder => folder.agent.toString() === agentId);
    
    if (existingIndex !== -1) {
      console.log('🔄 Updating existing folder at index:', existingIndex);
      updatedData[existingIndex] = {
        ...updatedData[existingIndex],
        id: transformedFolder.id,
        name: transformedFolder.name,
        source_count: transformedFolder.source_count,
        knowledge_sources: transformedFolder.knowledge_sources
      };
    } else {
      console.log('➕ Adding new folder to knowledge folders');
      updatedData.unshift({
        id: transformedFolder.id,
        agent: agentId,
        name: transformedFolder.name,
        description: transformedFolder.description,
        source_count: transformedFolder.source_count,
        status: transformedFolder.status,
        created_at: transformedFolder.created_at,
        updated_at: transformedFolder.updated_at
      });
    }
    
    const result = {
      ...oldData,
      data: updatedData
    };
    
    console.log('✅ Updated knowledge folders with details:', result);
    return result;
  });

  // Also update the specific agent knowledge sources cache
  queryClient.setQueryData(['agentKnowledgeSources', agentId], () => {
    console.log('📁 Updating agent knowledge sources cache for:', agentId);
    return {
      data: transformedFolder
    };
  });
};

// ✨ NEW: Pure cache-first unified update function
export const updateCachesAfterAgentCreation = (queryClient: any, apiResponse: any) => {
  console.log('🚀 CACHE-FIRST: Starting unified cache update for agent creation');
  console.log('📊 API response received:', apiResponse);
  console.log('🔍 Response structure analysis:');
  console.log('  - Has data property:', !!apiResponse.data);
  console.log('  - Data type:', typeof apiResponse.data);
  console.log('  - Agent ID:', apiResponse.data?.id);
  console.log('  - Agent name:', apiResponse.data?.name);
  
  // Transform the agent data using unified transformer
  const transformedAgent = transformAgentCreationResponse(apiResponse);
  
  if (!transformedAgent) {
    console.error('❌ Failed to transform agent creation response');
    return;
  }
  
  console.log('✅ Successfully transformed agent:', transformedAgent);
  
  // CACHE-FIRST: Update agent cache without triggering API calls
  console.log('📦 Step 1: Updating agent cache (CACHE-FIRST)');
  addAgentToCache(queryClient, transformedAgent);
  
  // CACHE-FIRST: Update knowledge folders cache
  console.log('📁 Step 2: Updating knowledge folder cache (CACHE-FIRST)');
  addKnowledgeFolderToCache(queryClient, apiResponse.data);
  
  // Log current cache keys for debugging
  const allCacheKeys = Array.from(queryClient.getQueryCache().getAll().map(query => query.queryKey));
  console.log('🔑 All current cache keys:', allCacheKeys);
  
  // Final verification - NO API CALLS MADE
  const agentsCache = queryClient.getQueryData(['agents']);
  const foldersCache = queryClient.getQueryData(['knowledgeFolders']);
  
  console.log('✅ CACHE-FIRST: Final agents cache verification:');
  console.log('  - Type:', Array.isArray(agentsCache) ? 'Array' : typeof agentsCache);
  console.log('  - Length:', Array.isArray(agentsCache) ? agentsCache.length : 'N/A');
  console.log('  - First agent ID:', Array.isArray(agentsCache) && agentsCache[0] ? agentsCache[0].id : 'N/A');
  console.log('  - Contains new agent:', Array.isArray(agentsCache) ? 
    agentsCache.some(a => a.id === apiResponse.data.id.toString()) : 'N/A');
  
  console.log('✅ CACHE-FIRST: Final folders cache verification:', foldersCache);
  
  console.log('🎉 CACHE-FIRST: Unified cache update completed - NO ADDITIONAL API CALLS MADE');
};
