
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import websocketService from '@/services/websocket';

interface TrainingStatus {
  agentId?: string;
  knowledgeBaseId?: number;
  status: 'idle' | 'started' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
  timestamp?: number;
}

interface TrainingStatusMap {
  agents: Record<string, TrainingStatus>;
  knowledgeBases: Record<number, TrainingStatus>;
}

interface TrainingStatusContextType {
  trainingStatuses: TrainingStatusMap;
  getAgentTrainingStatus: (agentId: string) => TrainingStatus | undefined;
  getKnowledgeBaseTrainingStatus: (knowledgeBaseId: number) => TrainingStatus | undefined;
  clearAgentTrainingStatus: (agentId: string) => void;
  clearKnowledgeBaseTrainingStatus: (knowledgeBaseId: number) => void;
}

// Define the type for training status updates from WebSocket
interface TrainingStatusUpdate {
  agentId?: string;
  knowledgeBaseId?: number;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
  timestamp: number;
}

const defaultTrainingStatusMap: TrainingStatusMap = {
  agents: {},
  knowledgeBases: {}
};

const TrainingStatusContext = createContext<TrainingStatusContextType | undefined>(undefined);

export const TrainingStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trainingStatuses, setTrainingStatuses] = useState<TrainingStatusMap>(defaultTrainingStatusMap);

  useEffect(() => {
    // Subscribe to all agent training status updates
    const agentTrainingUnsubscribe = websocketService.subscribe<TrainingStatusUpdate>('agent:training-status', (data) => {
      if (data.agentId) {
        setTrainingStatuses(prev => ({
          ...prev,
          agents: {
            ...prev.agents,
            [data.agentId!]: {
              agentId: data.agentId,
              status: data.status,
              progress: data.progress,
              message: data.message,
              error: data.error,
              timestamp: data.timestamp
            }
          }
        }));
      }
    });

    // Subscribe to all knowledge base training status updates
    const knowledgeTrainingUnsubscribe = websocketService.subscribe<TrainingStatusUpdate>('knowledge:training-status', (data) => {
      if (data.knowledgeBaseId) {
        setTrainingStatuses(prev => ({
          ...prev,
          knowledgeBases: {
            ...prev.knowledgeBases,
            [data.knowledgeBaseId!]: {
              knowledgeBaseId: data.knowledgeBaseId,
              status: data.status,
              progress: data.progress,
              message: data.message,
              error: data.error,
              timestamp: data.timestamp
            }
          }
        }));
      }
    });

    // Clean up subscriptions
    return () => {
      agentTrainingUnsubscribe();
      knowledgeTrainingUnsubscribe();
    };
  }, []);

  const getAgentTrainingStatus = (agentId: string): TrainingStatus | undefined => {
    return trainingStatuses.agents[agentId];
  };

  const getKnowledgeBaseTrainingStatus = (knowledgeBaseId: number): TrainingStatus | undefined => {
    return trainingStatuses.knowledgeBases[knowledgeBaseId];
  };

  const clearAgentTrainingStatus = (agentId: string) => {
    setTrainingStatuses(prev => {
      const newAgents = { ...prev.agents };
      delete newAgents[agentId];
      return {
        ...prev,
        agents: newAgents
      };
    });
  };

  const clearKnowledgeBaseTrainingStatus = (knowledgeBaseId: number) => {
    setTrainingStatuses(prev => {
      const newKnowledgeBases = { ...prev.knowledgeBases };
      delete newKnowledgeBases[knowledgeBaseId];
      return {
        ...prev,
        knowledgeBases: newKnowledgeBases
      };
    });
  };

  const value = {
    trainingStatuses,
    getAgentTrainingStatus,
    getKnowledgeBaseTrainingStatus,
    clearAgentTrainingStatus,
    clearKnowledgeBaseTrainingStatus
  };

  return (
    <TrainingStatusContext.Provider value={value}>
      {children}
    </TrainingStatusContext.Provider>
  );
};

export const useTrainingStatus = () => {
  const context = useContext(TrainingStatusContext);
  if (context === undefined) {
    throw new Error('useTrainingStatus must be used within a TrainingStatusProvider');
  }
  return context;
};
