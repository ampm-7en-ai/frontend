
import { useState, useCallback, useEffect } from 'react';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { getAccessToken, API_ENDPOINTS, BASE_URL } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { getTrainingStatusToast } from '@/components/agents/knowledge/knowledgeUtils';

export interface TrainingStatus {
  status: 'idle' | 'training' | 'complete' | 'error';
  progress: number;
  count: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
  sources: Record<number, {
    status: 'pending' | 'training' | 'success' | 'error';
    progress: number;
  }>;
}

export const useKnowledgeTraining = (agentId: string) => {
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    status: 'idle',
    progress: 0,
    count: {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    },
    sources: {},
  });
  const { toast } = useToast();
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const resetTrainingStatus = useCallback(() => {
    setTrainingStatus({
      status: 'idle',
      progress: 0,
      count: {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
      },
      sources: {},
    });
  }, []);

  const startTraining = useCallback(async (sources: KnowledgeSource[]) => {
    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to start training.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Initialize training status
      const initialSourceStatus: Record<number, { status: 'pending' | 'training' | 'success' | 'error', progress: number }> = {};
      sources.forEach(source => {
        initialSourceStatus[source.id] = { status: 'pending', progress: 0 };
      });

      setTrainingStatus({
        status: 'training',
        progress: 0,
        count: {
          total: sources.length,
          completed: 0,
          failed: 0,
          pending: sources.length,
        },
        sources: initialSourceStatus,
      });

      // Make API call to start training
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}train/${agentId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sources_ids: sources.map(source => source.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to start training' }));
        throw new Error(errorData.message || 'Failed to start training');
      }

      const data = await response.json();
      
      // Show start training toast
      toast({
        title: "Training started",
        description: `Training ${sources.length} knowledge sources. This may take some time.`,
      });

      // Start polling for status updates
      startPolling();
      
      return data;
    } catch (error) {
      console.error('Error starting training:', error);
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "Failed to start training process.",
        variant: "destructive",
      });
      
      setTrainingStatus(prev => ({
        ...prev,
        status: 'error',
      }));
    }
  }, [agentId, toast]);

  const startPolling = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    const interval = setInterval(() => {
      pollTrainingStatus();
    }, 3000); // Poll every 3 seconds
    
    setPollInterval(interval);
  }, [pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  }, [pollInterval]);

  const pollTrainingStatus = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !agentId) return;

    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}training-status/${agentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch training status');
      }

      const data = await response.json();
      
      // Process the response data
      const sourcesStatus: Record<number, { status: 'pending' | 'training' | 'success' | 'error', progress: number }> = {};
      let completed = 0;
      let failed = 0;
      let pending = 0;
      
      // Process each source status from the API response
      Object.entries(data.sources || {}).forEach(([sourceId, sourceData]: [string, any]) => {
        const status = sourceData.status as 'pending' | 'training' | 'success' | 'error';
        const progress = sourceData.progress || 0;
        
        sourcesStatus[parseInt(sourceId)] = { status, progress };
        
        if (status === 'success') completed++;
        else if (status === 'error') failed++;
        else pending++;
        
        // If a source just completed or failed, show a toast
        if (
          (status === 'success' || status === 'error') && 
          trainingStatus.sources[parseInt(sourceId)]?.status !== status
        ) {
          const sourceName = sourceData.name || `Source ${sourceId}`;
          toast(getTrainingStatusToast(status, sourceName));
        }
      });
      
      const total = Object.keys(sourcesStatus).length;
      const overallProgress = total > 0 
        ? ((completed + failed) / total) * 100 
        : 0;
      
      // Update the training status
      const newStatus: TrainingStatus = {
        status: pending === 0 ? (failed > 0 ? 'error' : 'complete') : 'training',
        progress: overallProgress,
        count: {
          total,
          completed,
          failed,
          pending,
        },
        sources: sourcesStatus,
      };
      
      setTrainingStatus(newStatus);
      
      // If training is complete, stop polling
      if (newStatus.status === 'complete' || newStatus.status === 'error') {
        stopPolling();
        
        toast({
          title: newStatus.status === 'complete' ? "Training complete" : "Training completed with errors",
          description: `${completed} sources trained successfully${failed > 0 ? `, ${failed} failed` : ''}.`,
          variant: newStatus.status === 'error' ? "destructive" : undefined,
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error polling training status:', error);
    }
  }, [agentId, toast, trainingStatus.sources, stopPolling]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  return {
    trainingStatus,
    startTraining,
    resetTrainingStatus,
    pollTrainingStatus,
  };
};
