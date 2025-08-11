
import React from 'react';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TrainingAlertBadgeProps {
  isVisible?: boolean;
  message?: string;
  className?: string;
  hasUntrainedAlert?: boolean;
  agentStatus?: string; // Use agent status instead of agentId
  agentName?: string; // Agent name for display
}

export const TrainingAlertBadge: React.FC<TrainingAlertBadgeProps> = ({
  isVisible: externalIsVisible,
  message = "Training in progress...",
  className,
  hasUntrainedAlert = false,
  agentStatus,
  agentName
}) => {
  // Check if agent is in training status
  const isAgentTraining = agentStatus === 'Training';
  
  console.log(`🔍 TrainingAlertBadge: Checking agent status:`, {
    agentStatus,
    isAgentTraining,
    agentName
  });

  // Determine if badge should be visible
  const shouldShowBadge = externalIsVisible || isAgentTraining;
  
  // Determine the message to show
  const displayMessage = isAgentTraining && agentName
    ? `Training ${agentName}...`
    : message;

  if (!shouldShowBadge) return null;

  return (
    <div className={cn(
      "fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
      "animate-in slide-in-from-top-2 fade-in-0",
      hasUntrainedAlert ? "top-32" : "top-6", // Adjust position if untrained alert is visible
      shouldShowBadge ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      className
    )}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Brain className="h-4 w-4 text-white" />
          </div>
          
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" className="!mb-0" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {displayMessage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
