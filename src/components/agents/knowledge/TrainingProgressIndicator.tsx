
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrainingProgressProps {
  status: 'idle' | 'training' | 'complete' | 'error';
  progress: number;
  count?: {
    total: number;
    completed: number;
    failed: number;
  };
}

export const TrainingProgressIndicator = ({ 
  status, 
  progress, 
  count = { total: 0, completed: 0, failed: 0 } 
}: TrainingProgressProps) => {
  const getStatusIcon = () => {
    switch(status) {
      case 'training':
        return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch(status) {
      case 'training': return 'bg-amber-500';
      case 'complete': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      default: return '';
    }
  };
  
  const getStatusText = () => {
    switch(status) {
      case 'idle':
        return 'Ready to train';
      case 'training':
        return `Training in progress (${count.completed} of ${count.total} complete)`;
      case 'complete':
        return 'Training complete';
      case 'error':
        return `Training completed with ${count.failed} errors`;
      default:
        return '';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className="mb-6 bg-white rounded-md border p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      
      <Progress 
        value={progress} 
        className={cn("h-2", status === 'error' && "bg-red-200")}
        indicatorClassName={getStatusColor()}
      />
      
      {(status === 'complete' || status === 'error') && (
        <div className="text-sm mt-2 flex justify-end">
          {count.completed > 0 && (
            <span className="text-green-600 flex items-center mr-4">
              <CheckCircle className="h-3 w-3 mr-1" /> {count.completed} successful
            </span>
          )}
          {count.failed > 0 && (
            <span className="text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {count.failed} failed
            </span>
          )}
        </div>
      )}
    </div>
  );
};
