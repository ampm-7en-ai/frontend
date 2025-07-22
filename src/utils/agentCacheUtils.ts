
import { Agent } from '@/hooks/useAgentFiltering';

// Transform API response data to match Agent interface
export const transformAgentResponse = (apiAgent: any): Agent => {
  return {
    id: apiAgent.id.toString(),
    name: apiAgent.name,
    description: apiAgent.description || '',
    conversations: 0, // New agents start with 0 conversations
    lastModified: apiAgent.created_at,
    averageRating: 0, // New agents start with 0 rating
    knowledgeSources: apiAgent.knowledge_sources?.map((kb: any, index: number) => ({
      id: kb.id || index,
      name: kb.name || `Source ${index + 1}`,
      type: kb.type || 'document',
      icon: 'BookOpen',
      hasError: kb.status === 'deleted',
      hasIssue: kb.status === 'issues'
    })) || [],
    model: apiAgent.model?.response_model || apiAgent.model?.selectedModel || apiAgent.model?.name || 'mistral-small',
    isDeployed: apiAgent.status === 'Live',
    status: apiAgent.status || 'Idle'
  };
};

// Transform knowledge folder API response to match expected format
export const transformKnowledgeFolderResponse = (apiResponse: any) => {
  if (!apiResponse.data) return null;
  
  return {
    id: apiResponse.data.folder_id,
    agent: apiResponse.data.folder_id, // Using folder_id as agent reference
    name: apiResponse.data.folder_name,
    description: '',
    source_count: apiResponse.data.knowledge_sources?.length || 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_sources: apiResponse.data.knowledge_sources || []
  };
};

// Add new agent to existing cache
export const addAgentToCache = (queryClient: any, newAgent: Agent) => {
  queryClient.setQueryData(['agents'], (oldData: Agent[] | undefined) => {
    if (!oldData) return [newAgent];
    
    // Check if agent already exists (prevent duplicates)
    const existingIndex = oldData.findIndex(agent => agent.id === newAgent.id);
    if (existingIndex !== -1) {
      // Update existing agent
      const updatedData = [...oldData];
      updatedData[existingIndex] = newAgent;
      return updatedData;
    }
    
    // Add new agent to the beginning of the list
    return [newAgent, ...oldData];
  });
};

// Add knowledge folder to cache from agent creation
export const addKnowledgeFolderToCache = (queryClient: any, agentData: any) => {
  queryClient.setQueryData(['knowledgeFolders'], (oldData: any) => {
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
    
    return {
      ...oldData,
      data: [newFolder, ...oldData.data]
    };
  });
};

// Update knowledge folder cache with detailed data from knowledge folder API
export const updateKnowledgeFolderWithDetails = (queryClient: any, agentId: string, folderResponse: any) => {
  const transformedFolder = transformKnowledgeFolderResponse(folderResponse);
  if (!transformedFolder) return;

  queryClient.setQueryData(['knowledgeFolders'], (oldData: any) => {
    if (!oldData || !oldData.data) return oldData;
    
    const updatedData = [...oldData.data];
    const existingIndex = updatedData.findIndex(folder => folder.agent.toString() === agentId);
    
    if (existingIndex !== -1) {
      // Update existing folder with detailed information
      updatedData[existingIndex] = {
        ...updatedData[existingIndex],
        id: transformedFolder.id,
        name: transformedFolder.name,
        source_count: transformedFolder.source_count,
        knowledge_sources: transformedFolder.knowledge_sources
      };
    } else {
      // Add new folder if it doesn't exist
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
    
    return {
      ...oldData,
      data: updatedData
    };
  });

  // Also update the specific agent knowledge sources cache
  queryClient.setQueryData(['agentKnowledgeSources', agentId], () => ({
    data: transformedFolder
  }));
};

// Unified cache update function for both agent and knowledge folder
export const updateCachesAfterAgentCreation = (queryClient: any, agentData: any) => {
  // Update agent cache
  const transformedAgent = transformAgentResponse(agentData);
  addAgentToCache(queryClient, transformedAgent);
  
  // Update knowledge folders cache with initial data
  addKnowledgeFolderToCache(queryClient, agentData);
  
  console.log('Updated both agent and knowledge folder caches after creation');
};
