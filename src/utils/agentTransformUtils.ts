
import { Agent } from '@/hooks/useAgentFiltering';

// Unified agent transformation function that handles both listing and cache scenarios
export const transformAgentData = (apiAgent: any): Agent => {
 
  
  // Handle both direct agent data and nested data.data structure
  const agentData = apiAgent;
  
  const transformed: Agent = {
    id: agentData.id.toString(),
    name: agentData.name || 'Untitled Agent',
    description: agentData.description || '',
    conversations: agentData.conversations || 0,
    lastModified: agentData.created_at || agentData.updated_at,
    averageRating: agentData.average_rating || 0,
    // Handle both knowledge_bases and knowledge_sources field variations
    knowledgeSources: (agentData.knowledge_bases || agentData.knowledge_sources || []).map((kb: any, index: number) => ({
      id: kb.id || index,
      name: kb.name || kb.title || `Source ${index + 1}`,
      type: kb.type || 'document',
      icon: 'BookOpen',
      hasError: kb.status === 'deleted',
      hasIssue: kb.status === 'issues' || kb.training_status === 'issues'
    })),
    model: {
      response_model: agentData.model?.response_model || 
           agentData.model?.selectedModel || 
           agentData.model?.name || 
           'mistral-small',
      // Prioritize display_model from API, then fall back to response_model as display
      display_name: agentData.model?.display_model ||  
           'Unknown Model'
    },
    isDeployed: agentData.status === 'Live',
    status: agentData.status || 'Idle'
  };
  
  console.log('✅ Unified transformation result:', transformed);
  return transformed;
};

// Transform array of agents for listing pages
export const transformAgentList = (apiResponse: any): Agent[] => {
  console.log('📋 Transforming agent list from API response:', apiResponse);
  
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    console.warn('⚠️ Invalid API response structure for agent list:', apiResponse);
    return [];
  }
  
  const transformedAgents = apiResponse.data.map(transformAgentData);
  console.log('✅ Transformed agent list:', transformedAgents.length, 'agents');
  
  return transformedAgents;
};

// Handle agent creation response specifically
export const transformAgentCreationResponse = (apiResponse: any): Agent | null => {

  
  if (!apiResponse.data) {
    return null;
  }
  
  const transformed = transformAgentData(apiResponse.data);
  
  return transformed;
};
