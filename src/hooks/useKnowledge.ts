
import { useState } from 'react';

export interface Knowledge {
  id: string;
  name: string;
  source_type: string;
}

export const useKnowledge = () => {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);

  const addKnowledge = async (knowledgeData: Partial<Knowledge>) => {
    // Mock implementation - replace with actual API call
    const newKnowledge: Knowledge = {
      id: Math.random().toString(36).substr(2, 9),
      name: knowledgeData.name || '',
      source_type: knowledgeData.source_type || '',
      ...knowledgeData
    };
    
    setKnowledge(prev => [...prev, newKnowledge]);
    return newKnowledge;
  };

  const updateKnowledge = async (knowledgeData: Partial<Knowledge> & { id: string }) => {
    // Mock implementation - replace with actual API call
    setKnowledge(prev => 
      prev.map(k => k.id === knowledgeData.id ? { ...k, ...knowledgeData } : k)
    );
    return knowledgeData;
  };

  return {
    knowledge,
    addKnowledge,
    updateKnowledge,
  };
};
