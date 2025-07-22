
import { useQueryClient } from '@tanstack/react-query';

export interface CachedKnowledgeSource {
  id: number;
  title: string;
  type: string;
  status: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

// Add knowledge source to agent's cached data
export const addKnowledgeSourceToAgentCache = (queryClient: any, agentId: string, newSource: CachedKnowledgeSource) => {
  console.log('🔄 Adding knowledge source to agent cache:', agentId, newSource);
  
  queryClient.setQueryData(['agents'], (oldData: any[] | undefined) => {
    if (!oldData || !Array.isArray(oldData)) return oldData;
    
    return oldData.map(agent => {
      if (agent.id === agentId) {
        const updatedKnowledgeSources = [...(agent.knowledgeSources || []), {
          id: newSource.id,
          name: newSource.title,
          type: newSource.type,
          size: 'N/A',
          lastUpdated: new Date().toLocaleDateString('en-GB'),
          trainingStatus: newSource.status,
          linkBroken: false,
          knowledge_sources: [],
          metadata: {}
        }];
        
        return {
          ...agent,
          knowledgeSources: updatedKnowledgeSources
        };
      }
      return agent;
    });
  });
  
  // Also update the specific agent knowledge sources cache
  queryClient.setQueryData(['agentKnowledgeSources', agentId], (oldData: any) => {
    if (!oldData) return oldData;
    
    const currentSources = oldData.knowledge_sources?.knowledge_sources || oldData.knowledge_sources || [];
    const updatedSources = [...currentSources, newSource];
    
    return {
      ...oldData,
      knowledge_sources: {
        ...oldData.knowledge_sources,
        knowledge_sources: updatedSources
      }
    };
  });
  
  // Notify components without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['agents'],
    exact: true,
    refetchType: 'none'
  });
  
  queryClient.invalidateQueries({ 
    queryKey: ['agentKnowledgeSources', agentId],
    refetchType: 'none'
  });
  
  console.log('✅ Knowledge source added to agent cache');
};

// Remove knowledge source from agent's cached data
export const removeKnowledgeSourceFromAgentCache = (queryClient: any, agentId: string, sourceId: number) => {
  console.log('🗑️ Removing knowledge source from agent cache:', agentId, sourceId);
  
  queryClient.setQueryData(['agents'], (oldData: any[] | undefined) => {
    if (!oldData || !Array.isArray(oldData)) return oldData;
    
    return oldData.map(agent => {
      if (agent.id === agentId) {
        const updatedKnowledgeSources = (agent.knowledgeSources || []).filter(
          (source: any) => source.id !== sourceId
        );
        
        return {
          ...agent,
          knowledgeSources: updatedKnowledgeSources
        };
      }
      return agent;
    });
  });
  
  // Also update the specific agent knowledge sources cache
  queryClient.setQueryData(['agentKnowledgeSources', agentId], (oldData: any) => {
    if (!oldData) return oldData;
    
    const currentSources = oldData.knowledge_sources?.knowledge_sources || oldData.knowledge_sources || [];
    const updatedSources = currentSources.filter((source: any) => source.id !== sourceId);
    
    return {
      ...oldData,
      knowledge_sources: {
        ...oldData.knowledge_sources,
        knowledge_sources: updatedSources
      }
    };
  });
  
  // Notify components without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['agents'],
    exact: true,
    refetchType: 'none'
  });
  
  queryClient.invalidateQueries({ 
    queryKey: ['agentKnowledgeSources', agentId],
    refetchType: 'none'
  });
  
  console.log('✅ Knowledge source removed from agent cache');
};

// Update knowledge source status in agent's cached data
export const updateKnowledgeSourceInAgentCache = (queryClient: any, agentId: string, sourceId: number, updates: Partial<CachedKnowledgeSource>) => {
  console.log('🔄 Updating knowledge source in agent cache:', agentId, sourceId, updates);
  
  queryClient.setQueryData(['agents'], (oldData: any[] | undefined) => {
    if (!oldData || !Array.isArray(oldData)) return oldData;
    
    return oldData.map(agent => {
      if (agent.id === agentId) {
        const updatedKnowledgeSources = (agent.knowledgeSources || []).map((source: any) => {
          if (source.id === sourceId) {
            return {
              ...source,
              name: updates.title || source.name,
              type: updates.type || source.type,
              trainingStatus: updates.status || source.trainingStatus,
              lastUpdated: new Date().toLocaleDateString('en-GB')
            };
          }
          return source;
        });
        
        return {
          ...agent,
          knowledgeSources: updatedKnowledgeSources
        };
      }
      return agent;
    });
  });
  
  // Also update the specific agent knowledge sources cache
  queryClient.setQueryData(['agentKnowledgeSources', agentId], (oldData: any) => {
    if (!oldData) return oldData;
    
    const currentSources = oldData.knowledge_sources?.knowledge_sources || oldData.knowledge_sources || [];
    const updatedSources = currentSources.map((source: any) => {
      if (source.id === sourceId) {
        return { ...source, ...updates };
      }
      return source;
    });
    
    return {
      ...oldData,
      knowledge_sources: {
        ...oldData.knowledge_sources,
        knowledge_sources: updatedSources
      }
    };
  });
  
  // Notify components without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['agents'],
    exact: true,
    refetchType: 'none'
  });
  
  queryClient.invalidateQueries({ 
    queryKey: ['agentKnowledgeSources', agentId],
    refetchType: 'none'
  });
  
  console.log('✅ Knowledge source updated in agent cache');
};
