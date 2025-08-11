
import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AgentTrainingService } from '@/services/AgentTrainingService';

interface TrainingAlertBadgeProps {
  isVisible?: boolean;
  message?: string;
  className?: string;
  hasUntrainedAlert?: boolean;
  agentId?: string; // Optional - if provided, will show training status for this specific agent
}

export const TrainingAlertBadge: React.FC<TrainingAlertBadgeProps> = ({
  isVisible: externalIsVisible,
  message = "Training in progress...",
  className,
  hasUntrainedAlert = false,
  agentId
}) => {
  const [hasTrainingTasks, setHasTrainingTasks] = useState(false);
  const [currentTrainingAgent, setCurrentTrainingAgent] = useState<string>('');

  // Check for training tasks in localStorage
  useEffect(() => {
    const checkTrainingTasks = () => {
      const allTasks = AgentTrainingService.getAllTrainingTasks();
      const taskEntries = Object.entries(allTasks);
      
      if (agentId) {
        // If agentId is provided, only check for this specific agent in localStorage
        const agentTask = allTasks[agentId];
        const isAgentTraining = agentTask && agentTask.status === 'training';
        console.log(`🔍 TrainingAlertBadge: Checking localStorage for agent ${agentId}:`, {
          agentTask,
          isAgentTraining
        });
        setHasTrainingTasks(isAgentTraining);
        setCurrentTrainingAgent(isAgentTraining ? agentTask.agentName : '');
      } else {
        // Check for any training tasks
        const activeTrainingTasks = taskEntries.filter(([_, task]) => task.status === 'training');
        setHasTrainingTasks(activeTrainingTasks.length > 0);
        
        if (activeTrainingTasks.length > 0) {
          const firstTask = activeTrainingTasks[0][1];
          setCurrentTrainingAgent(firstTask.agentName);
        } else {
          setCurrentTrainingAgent('');
        }
      }
    };

    // Check immediately
    checkTrainingTasks();
    
    // Set up polling to check periodically
    const interval = setInterval(checkTrainingTasks, 2000);
    
    return () => clearInterval(interval);
  }, [agentId]);

  // Determine if badge should be visible
  const shouldShowBadge = externalIsVisible || hasTrainingTasks;
  
  // Determine the message to show
  const displayMessage = hasTrainingTasks 
    ? `Training ${currentTrainingAgent}...`
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
