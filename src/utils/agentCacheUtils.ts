
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

// Also update knowledge folders cache when agent is created
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
