
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { KnowledgeSource } from './types';

interface KnowledgeTrainingStatusProps {
  source: KnowledgeSource;
  apiStatus?: 'pending' | 'training' | 'success' | 'error';
  progress?: number;
}

export const KnowledgeTrainingStatus = ({ 
  source, 
  apiStatus, 
  progress = 0 
}: KnowledgeTrainingStatusProps) => {
  // If API status is provided, use it instead of the source's trainingStatus
  const status = apiStatus || source.trainingStatus || 'pending';
  const [displayProgress, setDisplayProgress] = useState(progress);
  
  useEffect(() => {
    // If API provides progress, always use that
    if (apiStatus === 'training') {
      setDisplayProgress(progress);
    }
  }, [apiStatus, progress]);

  if (status === 'success') {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        <span className="text-sm">Trained</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="h-4 w-4 mr-1.5" />
        <span className="text-sm">Error</span>
      </div>
    );
  }

  if (status === 'training') {
    return (
      <div className="w-[150px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-amber-500 flex items-center">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Training
          </span>
          <span className="text-xs font-medium">{Math.round(displayProgress)}%</span>
        </div>
        <Progress value={displayProgress} className="h-1.5" />
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
