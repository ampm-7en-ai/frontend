
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
    const modelLower = model.toLowerCase();
    if (modelLower.includes('gpt-4')) {
      return 'indigo';
    } else if (modelLower.includes('gpt-3.5')) {
      return 'green';
    } else if (modelLower.includes('claude')) {
      return 'purple';
    } else {
      return 'blue';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (statusLower === 'training') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (statusLower === 'issues') {
      return 'bg-red-50 text-red-700 border-red-200';
    } else if (statusLower === 'pending') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
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
