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
    // Only connect to WebSocket if user is authenticated
    if (user) {
      webSocketService.connect();
      
      // Listen for training updates
      webSocketService.on('agent_training_update', handleTrainingUpdate);
      
      // Cleanup on unmount
      return () => {
        webSocketService.off('agent_training_update', handleTrainingUpdate);
      };
    }
  }, [user]);

  const handleTrainingUpdate = (data: any) => {
    const { agentId, progress, status, error } = data;
    
    setTrainingProcesses(prevProcesses => {
      const existingProcessIndex = prevProcesses.findIndex(p => p.agentId === agentId);
      
      if (existingProcessIndex === -1) return prevProcesses;
      
      const updatedProcesses = [...prevProcesses];
      const process = {...updatedProcesses[existingProcessIndex]};
      
      process.progress = progress;
      process.status = status;
      
      if (status === 'completed' || status === 'failed') {
        process.endTime = new Date();
        if (error) process.error = error;
        
        // Show a toast when training completes
        if (status === 'completed') {
          toast({
            title: 'Training Complete',
            description: `Agent "${process.agentName}" training has completed successfully.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Training Failed',
            description: error || `Agent "${process.agentName}" training has failed.`,
            variant: 'destructive',
          });
        }
      }
      
      updatedProcesses[existingProcessIndex] = process;
      return updatedProcesses;
    });
  };

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
