
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { KnowledgeSource } from './types';
import { useKnowledgeTraining } from '@/hooks/useKnowledgeTraining';

interface KnowledgeTrainingStatusProps {
  source?: KnowledgeSource;
  apiStatus?: 'pending' | 'training' | 'success' | 'error';
  progress?: number;
  agentId?: string; // Added agentId prop
}

export const KnowledgeTrainingStatus = ({ 
  source, 
  apiStatus, 
  progress = 0,
  agentId 
}: KnowledgeTrainingStatusProps) => {
  // If API status is provided, use it instead of the source's trainingStatus
  const status = apiStatus || (source?.trainingStatus ?? 'pending');
  const [displayProgress, setDisplayProgress] = useState(progress);
  
  useEffect(() => {
    // If API provides progress, always use that
    if (apiStatus === 'training') {
      setDisplayProgress(progress);
    }
  }, [apiStatus, progress]);

  // If no source is provided but agentId is, use the knowledge training hook
  const { trainingStatus } = useKnowledgeTraining(agentId || '');

  // Use either the individual source status or the overall training status
  const effectiveStatus = source ? status : trainingStatus?.status === 'training' ? 'training' : 
                          trainingStatus?.status === 'complete' ? 'success' : 
                          trainingStatus?.status === 'error' ? 'error' : 'pending';
  
  const effectiveProgress = source ? displayProgress : trainingStatus?.progress || 0;

  if (effectiveStatus === 'success') {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        <span className="text-sm">Trained</span>
      </div>
    );
  }

  if (effectiveStatus === 'error') {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="h-4 w-4 mr-1.5" />
        <span className="text-sm">Error</span>
      </div>
    );
  }

  if (effectiveStatus === 'training') {
    return (
      <div className="w-[150px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-amber-500 flex items-center">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Training
          </span>
          <span className="text-xs font-medium">{Math.round(effectiveProgress)}%</span>
        </div>
        <Progress value={effectiveProgress} className="h-1.5" />
      </div>
    );
  }

  return (
    <div className="flex items-center text-muted-foreground">
      <Clock className="h-4 w-4 mr-1.5" />
      <span className="text-sm">Pending</span>
    </div>
  );
};
