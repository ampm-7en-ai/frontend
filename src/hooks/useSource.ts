
import { useState } from 'react';

export interface Source {
  id: string;
  name: string;
  source_type: string;
  agent_id: string;
  knowledge_id: string;
}

export const useSource = () => {
  const [sources, setSources] = useState<Source[]>([]);

  const addSource = async (sourceData: Partial<Source>) => {
    // Mock implementation - replace with actual API call
    const newSource: Source = {
      id: Math.random().toString(36).substr(2, 9),
      name: sourceData.name || '',
      source_type: sourceData.source_type || '',
      agent_id: sourceData.agent_id || '',
      knowledge_id: sourceData.knowledge_id || '',
      ...sourceData
    };
    
    setSources(prev => [...prev, newSource]);
    return newSource;
  };

  return {
    sources,
    addSource,
  };
};
