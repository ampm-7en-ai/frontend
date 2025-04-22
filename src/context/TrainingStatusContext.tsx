
import React, { createContext, useContext, useState, useEffect } from 'react';
import { webSocketService } from '@/services/WebSocketService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface TrainingProcess {
  agentId: string;
  agentName: string;
  progress: number;
  status: 'pending' | 'training' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
}

interface TrainingStatusContextType {
  trainingProcesses: TrainingProcess[];
  startTraining: (agentId: string, agentName: string) => void;
  getTrainingProcess: (agentId: string) => TrainingProcess | undefined;
  isTraining: (agentId: string) => boolean;
}

const TrainingStatusContext = createContext<TrainingStatusContextType | undefined>(undefined);

export const TrainingStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainingProcesses, setTrainingProcesses] = useState<TrainingProcess[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Establish WebSocket connection when the component mounts and user is authenticated
    if (user) {
      webSocketService.connect();

      // Clean up WebSocket connection on unmount
      return () => {
        webSocketService.disconnect();
      };
    }
  }, [user]);

  // Handle training updates from WebSocket messages
  useEffect(() => {
    const handleTrainingUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'training_update') return;

        const { agentId, status, progress, message } = data;
        
        setTrainingProcesses(prevProcesses => {
          const existingProcessIndex = prevProcesses.findIndex(p => p.agentId === agentId);
          
          if (existingProcessIndex === -1) return prevProcesses;
          
          const updatedProcesses = [...prevProcesses];
          const process = {...updatedProcesses[existingProcessIndex]};
          
          switch (status) {
            case 'started':
              process.status = 'training';
              process.progress = 0;
              break;
            case 'in_progress':
              process.status = 'training';
              process.progress = progress || 0;
              break;
            case 'completed':
              process.status = 'completed';
              process.progress = 100;
              process.endTime = new Date();
              break;
            case 'failed':
              process.status = 'failed';
              process.endTime = new Date();
              process.error = message;
              break;
          }
          
          updatedProcesses[existingProcessIndex] = process;
          return updatedProcesses;
        });
      } catch (error) {
        console.error('Error handling training update:', error);
      }
    };

    // Add the event listener to the WebSocket instance
    if (user) {
      webSocketService.connect();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [user]);

  const startTraining = (agentId: string, agentName: string) => {
    setTrainingProcesses(prev => [
      ...prev.filter(p => p.agentId !== agentId),
      {
        agentId,
        agentName,
        progress: 0,
        status: 'pending',
        startTime: new Date(),
      }
    ]);
  };

  const getTrainingProcess = (agentId: string) => {
    return trainingProcesses.find(p => p.agentId === agentId);
  };

  const isTraining = (agentId: string) => {
    const process = getTrainingProcess(agentId);
    return !!process && (process.status === 'pending' || process.status === 'training');
  };

  return (
    <TrainingStatusContext.Provider value={{
      trainingProcesses,
      startTraining,
      getTrainingProcess,
      isTraining,
    }}>
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
