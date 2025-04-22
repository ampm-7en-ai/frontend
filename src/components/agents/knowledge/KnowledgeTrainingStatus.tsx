import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TrainingProgressIndicator } from '@/components/ui/training-progress';
import { Progress } from '@/components/ui/progress';
import { LoaderCircle, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { mockKnowledgeBaseTrainingProgress } from '@/utils/websocket-mock';
import { useKnowledgeBaseTrainingStatus } from '@/hooks/useWebSocket';
import { useTrainingStatus } from '@/context/TrainingStatusContext';

interface KnowledgeTrainingStatusProps {
  knowledgeBaseId: number;
  knowledgeBaseName?: string;
  useCompactView?: boolean;
  onTrainingComplete?: () => void;
  className?: string;
}

interface AgentKnowledgeTrainingStatusProps {
  agentId: string;
  knowledgeBases: Array<{ id: number; name: string; }>;
  onAllTrainingComplete?: () => void;
  className?: string;
}

interface AgentEditKnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: any[];
  isLoading?: boolean;
  loadError?: string | null;
  onKnowledgeBasesChanged?: () => void;
}

export const KnowledgeTrainingStatus: React.FC<KnowledgeTrainingStatusProps> = ({
  knowledgeBaseId,
  knowledgeBaseName = 'Knowledge Base',
  useCompactView = false,
  onTrainingComplete,
  className = ''
}) => {
  const { toast } = useToast();
  const { getKnowledgeBaseTrainingStatus } = useTrainingStatus();
  const trainingStatus = getKnowledgeBaseTrainingStatus(knowledgeBaseId);
  
  useKnowledgeBaseTrainingStatus(knowledgeBaseId, (data) => {
    if (data.status === 'completed') {
      toast({
        title: "Training Complete",
        description: `${knowledgeBaseName} training has been completed successfully.`,
      });
      if (onTrainingComplete) onTrainingComplete();
    } else if (data.status === 'failed') {
      toast({
        title: "Training Failed",
        description: data.message || `${knowledgeBaseName} training has failed.`,
        variant: "destructive"
      });
    }
  });
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !trainingStatus && knowledgeBaseId) {
      const cleanup = mockKnowledgeBaseTrainingProgress(knowledgeBaseId, knowledgeBaseName, onTrainingComplete);
      return () => cleanup();
    }
  }, [knowledgeBaseId, knowledgeBaseName, onTrainingComplete, trainingStatus]);
  
  if (!trainingStatus || trainingStatus.status === 'idle') {
    return null;
  }
  
  if (useCompactView) {
    return (
      <div className={`flex items-center ${className}`}>
        {(trainingStatus.status === 'started' || trainingStatus.status === 'in_progress') && (
          <>
            <LoaderCircle className="h-4 w-4 mr-2 text-blue-500 animate-spin" />
            <span className="text-xs text-blue-500">
              Training ({trainingStatus.progress || 0}%)
            </span>
          </>
        )}
        
        {trainingStatus.status === 'completed' && (
          <>
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-xs text-green-500">Trained</span>
          </>
        )}
        
        {trainingStatus.status === 'failed' && (
          <>
            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
            <span className="text-xs text-red-500">Failed</span>
          </>
        )}
      </div>
    );
  }
  
  return (
    <TrainingProgressIndicator
      status={trainingStatus.status}
      progress={trainingStatus.progress}
      message={trainingStatus.message}
      error={trainingStatus.error}
      className={className}
    />
  );
};

export const AgentKnowledgeTrainingStatus: React.FC<AgentKnowledgeTrainingStatusProps> = ({
  agentId,
  knowledgeBases,
  onAllTrainingComplete,
  className = ''
}) => {
  const { trainingStatuses } = useTrainingStatus();
  const { toast } = useToast();
  const [allComplete, setAllComplete] = useState(false);
  
  useEffect(() => {
    if (!knowledgeBases || knowledgeBases.length === 0) return;
    
    const allKnowledgeBases = knowledgeBases.map(kb => kb.id);
    const trainingKnowledgeBases = allKnowledgeBases.filter(id => {
      const status = trainingStatuses.knowledgeBases[id]?.status;
      return status === 'started' || status === 'in_progress';
    });
    
    const completedKnowledgeBases = allKnowledgeBases.filter(id => {
      return trainingStatuses.knowledgeBases[id]?.status === 'completed';
    });
    
    const failedKnowledgeBases = allKnowledgeBases.filter(id => {
      return trainingStatuses.knowledgeBases[id]?.status === 'failed';
    });
    
    if (trainingKnowledgeBases.length === 0 && 
        (completedKnowledgeBases.length > 0 || failedKnowledgeBases.length > 0) &&
        !allComplete && 
        completedKnowledgeBases.length + failedKnowledgeBases.length === allKnowledgeBases.length) {
      
      setAllComplete(true);
      
      if (failedKnowledgeBases.length === 0) {
        toast({
          title: "All Knowledge Bases Trained",
          description: "Your agent is ready to use all knowledge bases.",
        });
        if (onAllTrainingComplete) onAllTrainingComplete();
      } else {
        toast({
          title: "Training Complete with Errors",
          description: `${failedKnowledgeBases.length} knowledge bases failed training.`,
          variant: "destructive"
        });
      }
    }
  }, [trainingStatuses, knowledgeBases, onAllTrainingComplete, toast, allComplete]);
  
  const hasActiveTraining = knowledgeBases.some(kb => {
    const status = trainingStatuses.knowledgeBases[kb.id]?.status;
    return status === 'started' || status === 'in_progress';
  });
  
  if (!hasActiveTraining && !allComplete) {
    return null;
  }
  
  return (
    <div className={`p-3 border rounded-md bg-blue-50 border-blue-200 text-blue-800 ${className}`}>
      <div className="flex items-center mb-2">
        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
        <span className="font-medium">Training knowledge bases for agent</span>
      </div>
      
      <div className="space-y-3 mt-2">
        {knowledgeBases.map((kb) => {
          const status = trainingStatuses.knowledgeBases[kb.id];
          
          if (!status) return null;
          
          return (
            <div key={kb.id} className="flex flex-col">
              <div className="flex justify-between text-sm mb-1">
                <span>{kb.name}</span>
                <span>
                  {status.status === 'completed' && '100%'}
                  {status.status === 'failed' && 'Failed'}
                  {(status.status === 'started' || status.status === 'in_progress') && 
                   `${status.progress || 0}%`}
                </span>
              </div>
              <Progress 
                value={status.status === 'completed' ? 100 : status.progress} 
                className="h-1.5 w-full"
              />
              {status.message && (
                <p className="text-xs mt-1 text-blue-700">{status.message}</p>
              )}
              {status.error && (
                <p className="text-xs mt-1 text-red-600">{status.error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const KnowledgeTrainingStatusForAgentEdit: React.FC<AgentEditKnowledgeTrainingStatusProps> = ({
  agentId,
  initialSelectedSources = [],
  onSourcesChange,
  preloadedKnowledgeSources = [],
  isLoading = false,
  loadError = null,
  onKnowledgeBasesChanged
}) => {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Knowledge Base Training Status</h3>
        <p>Agent ID: {agentId}</p>
        <p>Selected Sources: {initialSelectedSources.join(', ')}</p>
        {isLoading && <p>Loading knowledge sources...</p>}
        {loadError && <p className="text-red-500">Error: {loadError}</p>}
        {preloadedKnowledgeSources.length > 0 && (
          <p>Preloaded knowledge sources: {preloadedKnowledgeSources.length}</p>
        )}
        
        <div className="mt-4">
          <Button onClick={() => onKnowledgeBasesChanged && onKnowledgeBasesChanged()}>
            Refresh Knowledge Bases
          </Button>
        </div>
      </div>
    </div>
  );
};

import { Button } from '@/components/ui/button';
