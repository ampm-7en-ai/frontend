
import { useState, useMemo } from 'react';

export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon?: string; // Make icon optional
  hasError: boolean;
  linkBroken?: boolean; // Add linkBroken property
  content?: string; // Add content property
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
}

interface UseAgentFilteringResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  modelFilter: string;
  setModelFilter: (filter: string) => void;
  filteredAgents: Agent[];
  getModelBadgeColor: (model: string) => string;
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

  return {
    searchQuery,
    setSearchQuery,
    modelFilter,
    setModelFilter,
    filteredAgents,
    getModelBadgeColor,
  };
};
