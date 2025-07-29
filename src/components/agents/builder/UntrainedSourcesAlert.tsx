
import React from 'react';
import { AlertTriangle, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UntrainedSourcesAlertProps {
  isVisible: boolean;
  untrainedCount: number;
  onRetrain: () => void;
  onDismiss: () => void;
  isTraining?: boolean;
  className?: string;
}

export const UntrainedSourcesAlert: React.FC<UntrainedSourcesAlertProps> = ({
  isVisible,
  untrainedCount,
  onRetrain,
  onDismiss,
  isTraining = false,
  className
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
      "animate-in slide-in-from-top-4 fade-in-0",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
      className
    )}>
      <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {untrainedCount} untrained knowledge source{untrainedCount > 1 ? 's' : ''} detected
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Retrain your agent to use the latest knowledge sources
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="h-8 px-3 text-xs"
            >
              Later
            </Button>
            <Button
              onClick={onRetrain}
              disabled={isTraining}
              size="sm"
              className="h-8 px-3 text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-700"
            >
              <Zap className="h-3 w-3" />
              {isTraining ? 'Training...' : 'Retrain'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
