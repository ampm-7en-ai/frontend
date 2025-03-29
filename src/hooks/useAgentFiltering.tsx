
import { useState, useMemo } from 'react';

export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon?: string;
  hasError: boolean;
  linkBroken?: boolean;
  content?: string;
  status?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  conversations: number;
  lastModified: string;
  averageRating: number;
  knowledgeSources: KnowledgeSource[];
  model: string;
  isDeployed: boolean;
  systemPrompt?: string;
  status?: string;
}

interface UseAgentFilteringResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  modelFilter: string;
  setModelFilter: (filter: string) => void;
  filteredAgents: Agent[];
  getModelBadgeColor: (model: string) => string;
  getStatusBadgeColor: (status: string) => string;
}

export const useAgentFiltering = (agents: Agent[]): UseAgentFilteringResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('all');

  const filteredAgents = useMemo(() => {
    return agents
      .filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(agent => modelFilter === 'all' || agent.model === modelFilter);
  }, [agents, searchQuery, modelFilter]);

  const getModelBadgeColor = (model: string) => {
    switch(model) {
      case 'gpt-4': return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'gpt-3.5': return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'claude-3': return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default: return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'live': return "bg-green-100 text-green-800";
      case 'training': return "bg-blue-100 text-blue-800";
      case 'error': return "bg-red-100 text-red-800";
      case 'pending': return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    modelFilter,
    setModelFilter,
    filteredAgents,
    getModelBadgeColor,
    getStatusBadgeColor,
  };
};
