
import { Agent } from '@/hooks/useAgentFiltering';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

interface ApiKnowledgeSource {
  id: number;
  title: string;
  status: string;
  type: string;
  urls?: string[];
  file?: string;
  plain_text?: string;
  google_drive_file_id?: string;
  metadata?: any;
  training_status?: string;
}

interface ApiAgent {
  id: number;
  name: string;
  description: string;
  status: string;
  model: {
    response_model: string;
    display_model: string; // This is the field from API
    temperature?: number;
    token_length?: number;
  };
  knowledge_sources: ApiKnowledgeSource[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: ApiAgent[];
  message: string;
  status: string;
}

const transformKnowledgeSource = (source: ApiKnowledgeSource): KnowledgeSource => {
  return {
    id: source.id, // Keep as number, don't convert to string
    name: source.title,
    type: source.type as 'document' | 'url' | 'text' | 'database' | 'webpage',
    hasError: source.status?.toLowerCase() === 'error' || source.training_status?.toLowerCase() === 'error',
    hasIssue: source.status?.toLowerCase() === 'warning' || source.training_status?.toLowerCase() === 'warning',
    status: source.status || 'unknown',
    url: source.file || source.urls?.[0],
    content: source.plain_text
  };
};

export const transformAgentList = (apiResponse: ApiResponse | { data: ApiAgent[] }): Agent[] => {
  console.log('🔄 transformAgentList: Transforming API response');
  
  const agentsData = Array.isArray(apiResponse.data) ? apiResponse.data : [];
  console.log('📊 Raw agents data:', agentsData.length, 'agents');
  
  return agentsData.map((apiAgent: ApiAgent) => {
    const transformedAgent: Agent = {
      id: apiAgent.id.toString(),
      name: apiAgent.name,
      description: apiAgent.description,
      status: apiAgent.status || 'Unknown',
      conversations: Math.floor(Math.random() * 50), // Mock data since not in API
      lastModified: apiAgent.updated_at || apiAgent.created_at,
      averageRating: 4.2, // Mock data since not in API
      knowledgeSources: (apiAgent.knowledge_sources || []).map(transformKnowledgeSource),
      model: {
        response_model: apiAgent.model?.response_model || 'unknown',
        display_name: apiAgent.model?.display_model || 'Unknown Model' // Map display_model to display_name
      },
      isDeployed: apiAgent.status?.toLowerCase() === 'active'
    };
    
    console.log('✅ Transformed agent:', {
      id: transformedAgent.id,
      name: transformedAgent.name,
      modelDisplayName: transformedAgent.model.display_name,
      responseModel: transformedAgent.model.response_model
    });
    
    return transformedAgent;
  });
};

// Transform single agent data (used by cache utils)
export const transformAgentData = (apiAgent: ApiAgent): Agent => {
  console.log('🔄 transformAgentData: Transforming single agent');
  
  return {
    id: apiAgent.id.toString(),
    name: apiAgent.name,
    description: apiAgent.description,
    status: apiAgent.status || 'Unknown',
    conversations: Math.floor(Math.random() * 50), // Mock data since not in API
    lastModified: apiAgent.updated_at || apiAgent.created_at,
    averageRating: 4.2, // Mock data since not in API
    knowledgeSources: (apiAgent.knowledge_sources || []).map(transformKnowledgeSource),
    model: {
      response_model: apiAgent.model?.response_model || 'unknown',
      display_name: apiAgent.model?.display_model || 'Unknown Model' // Map display_model to display_name
    },
    isDeployed: apiAgent.status?.toLowerCase() === 'active'
  };
};

// Transform agent creation response (used by cache utils)
export const transformAgentCreationResponse = (apiResponse: { data: ApiAgent }): Agent => {
  console.log('🔄 transformAgentCreationResponse: Transforming creation response');
  
  if (!apiResponse.data) {
    console.warn('❌ No data in agent creation response');
    return null;
  }
  
  return transformAgentData(apiResponse.data);
};
