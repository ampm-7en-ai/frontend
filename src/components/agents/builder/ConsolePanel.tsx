
import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTrainingTaskForAgent } from '@/services/AgentTrainingService';
import { useToast } from '@/hooks/use-toast';

interface ConsolePanelProps {
  agentId: string;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ agentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [trainingTask, setTrainingTask] = useState<any>(null);
  const [copiedTaskId, setCopiedTaskId] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load training task data for the agent
    const task = getTrainingTaskForAgent(agentId);
    if (task) {
      setTrainingTask(task);
      console.log('Training Task for Agent:', agentId, task);
    }
  }, [agentId]);

  const copyTaskId = async (taskId: string) => {
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedTaskId(true);
      setTimeout(() => setCopiedTaskId(false), 2000);
      toast({
        title: "Copied",
        description: "Task ID copied to clipboard",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to copy task ID:', error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Console Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Console</span>
          {trainingTask && (
            <Badge variant="secondary" className="text-xs">
              Training Active
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Console Content */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="max-h-60 overflow-y-auto p-4">
            {trainingTask ? (
              <Card className="p-4 bg-white dark:bg-gray-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Training Task Details
                    </h4>
                    <Badge 
                      variant={trainingTask.status === 'started' ? 'default' : 
                               trainingTask.status === 'completed' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {trainingTask.status.charAt(0).toUpperCase() + trainingTask.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Agent:</span>
                      <div className="font-mono text-gray-900 dark:text-gray-100 mt-1">
                        {trainingTask.agentName} ({trainingTask.agentId})
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Started:</span>
                      <div className="font-mono text-gray-900 dark:text-gray-100 mt-1">
                        {new Date(trainingTask.startTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Task ID:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-gray-100 break-all">
                        {trainingTask.taskId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={() => copyTaskId(trainingTask.taskId)}
                      >
                        {copiedTaskId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active training tasks</p>
                <p className="text-xs mt-1">Training task details will appear here when agent training starts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
