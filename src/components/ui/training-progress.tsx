
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { LoaderCircle, Check, AlertTriangle } from 'lucide-react';

interface TrainingProgressProps {
  status: 'idle' | 'started' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
  className?: string;
}

export const TrainingProgressIndicator = ({
  status,
  progress = 0,
  message,
  error,
  className = ''
}: TrainingProgressProps) => {
  if (status === 'idle') return null;

  const isInProgress = status === 'started' || status === 'in_progress';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  
  const statusClasses = {
    started: 'bg-amber-50 border-amber-200 text-amber-800',
    in_progress: 'bg-blue-50 border-blue-200 text-blue-800',
    completed: 'bg-green-50 border-green-200 text-green-800',
    failed: 'bg-red-50 border-red-200 text-red-800'
  };
  
  const currentStatusClass = statusClasses[status] || statusClasses.in_progress;

  return (
    <div className={`p-3 border rounded-md ${currentStatusClass} text-sm flex flex-col ${className}`}>
      <div className="flex items-center mb-2">
        {isInProgress && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
        {isCompleted && <Check className="h-4 w-4 mr-2" />}
        {isFailed && <AlertTriangle className="h-4 w-4 mr-2" />}
        
        <span className="font-medium">
          {isInProgress && 'Training in progress...'}
          {isCompleted && 'Training completed'}
          {isFailed && 'Training failed'}
        </span>
      </div>
      
      {message && <p className="mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      
      {isInProgress && (
        <Progress 
          value={progress} 
          className="h-2 w-full bg-blue-100"
          style={{
            '--tw-bg-opacity': '0.2'
          } as React.CSSProperties}
        />
      )}
    </div>
  );
};
