
import { useState, useMemo } from 'react';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

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
      return 'bg-green-50 dark:bg-green-800/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40';
    } else if (statusLower === 'training') {
      return 'bg-blue-50 dark:bg-blue-800/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
    } else if (statusLower === 'issues') {
      return 'bg-red-50 dark:bg-red-800/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40';
    } else if (statusLower === 'pending') {
      return 'bg-yellow-50 dark:bg-yellow-800/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40';
    } else {
      return 'bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-900/40';
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
