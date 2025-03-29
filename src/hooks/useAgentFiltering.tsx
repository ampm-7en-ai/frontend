
import { useState, useMemo } from 'react';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

export interface Agent {
  id: string;
  name: string;
  description: string;
  conversations?: number;
  lastModified?: string;
  averageRating?: number;
  knowledgeSources: KnowledgeSource[];
  model: string;
  isDeployed: boolean;
  status: string;
}

interface UseAgentFilteringProps {
  agents: Agent[];
  searchQuery: string;
  modelFilter: string;
  setSearchQuery: (query: string) => void;
  setModelFilter: (model: string) => void;
}

export const useAgentFiltering = ({
  agents,
  searchQuery,
  modelFilter,
  setSearchQuery,
  setModelFilter
}: UseAgentFilteringProps) => {
  
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by model
      const matchesModel = modelFilter === 'all' || 
        agent.model.toLowerCase().includes(modelFilter.toLowerCase());
      
      return matchesSearch && matchesModel;
    });
  }, [agents, searchQuery, modelFilter]);
  
  const getModelBadgeColor = (model: string) => {
    switch (model.toLowerCase()) {
      case 'gpt-4':
        return 'indigo';
      case 'gpt-3.5':
        return 'green';
      case 'claude-3':
        return 'purple';
      default:
        return 'blue';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'green';
      case 'training':
        return 'blue';
      case 'error':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };
  
  return {
    searchQuery,
    setSearchQuery,
    modelFilter,
    setModelFilter,
    filteredAgents,
    getModelBadgeColor,
    getStatusBadgeColor
  };
};

export default useAgentFiltering;
