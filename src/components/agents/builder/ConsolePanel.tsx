
import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { useBuilder } from '@/components/agents/builder/BuilderContext';

interface ConsolePanelProps {
  className?: string;
  isTraining?: boolean;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const { state } = useBuilder();
  
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Determine if console should be visible
  const shouldShowConsole = currentTask || isTraining;

  const handleCopyTaskId = async (taskId: string) => {
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedTaskId(taskId);
      setTimeout(() => setCopiedTaskId(null), 2000);
    } catch (error) {
      console.error('Failed to copy task ID:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Don't render if conditions aren't met
  if (!shouldShowConsole) {
    return null;
  }

  return (
    <div className={`absolute bottom-4 left-4 right-4 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg transition-all duration-300 ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Training Status
          </span>
          {(currentTask || isTraining) && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentTask ? getStatusColor(currentTask.status) : 'text-blue-600 bg-blue-50'
            }`}>
              {currentTask ? currentTask.status : 'training'}
            </span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Console Content */}
      {isExpanded && (
        <div className="p-4 max-h-60 overflow-y-auto">
          {currentTask ? (
            <Card className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Training Task Information
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Agent:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {currentTask.agentName}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(currentTask.status)}`}>
                      {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Started:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {formatTimestamp(currentTask.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Task ID:</span>
                      <div className="ml-2 font-mono text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 px-2 py-1 rounded border break-all">
                        {currentTask.taskId}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyTaskId(currentTask.taskId)}
                      className="ml-2 h-6 w-6 p-0"
                      title="Copy Task ID"
                    >
                      {copiedTaskId === currentTask.taskId ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : isTraining ? (
            <div className="text-center text-blue-600 dark:text-blue-400 py-4">
              <Terminal className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Training in progress...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Task ID will be available shortly</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No training tasks found for this agent</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
