
import { useState } from 'react';

export interface Agent {
  id: string;
  name: string;
}

export const useAgent = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  const getAgent = async (id: string) => {
    // Mock implementation - replace with actual API call
    return agents.find(agent => agent.id === id) || null;
  };

  return {
    agents,
    getAgent,
  };
};
