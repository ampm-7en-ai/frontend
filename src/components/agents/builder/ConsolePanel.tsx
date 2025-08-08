import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check, LoaderCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { isPolling, getCurrentPollingAgent } from '@/utils/trainingPoller';
import { useBuilder } from '@/components/agents/builder/BuilderContext';
import ModernButton from '@/components/dashboard/ModernButton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsolePanelProps {
  className?: string;
  isTraining?: boolean;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const { state } = useBuilder();
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Check polling connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      const polling = isPolling();
      const currentAgent = getCurrentPollingAgent();
      
      const status = polling ? 'open' : 'closed';
      setConnectionStatus(status);
      
      console.log('Console: Polling status:', { polling, currentAgent, status });
    };

    checkConnectionStatus();
    const interval = setInterval(isPolling() && checkConnectionStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Force re-render when task status might have changed
  useEffect(() => {
    if (currentTask) {
      const interval = setInterval(() => {
        setForceUpdate(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentTask]);

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { label: 'Completed', className: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/60 dark:text-green-400 dark:border-green-700' },
      'completed': { label: 'Completed', className: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/60 dark:text-green-400 dark:border-green-700' },
      'Training': { label: 'Training', className: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
      'training': { label: 'Training', className: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
      'Issues': { label: 'Failed', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'failed': { label: 'Failed', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'deleted': { label: 'Deleted', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'pending': { label: 'Pending', className: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' },
    };

    const config = statusConfig[status] || { label: 'Unknown', className: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' };
    return <Badge className={`${config.className} text-[9px] font-medium`}>{config.label}</Badge>;
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'open':
        return <Wifi className="h-3 w-3 text-green-600" />;
      case 'connecting':
        return <LoaderCircle className="h-3 w-3 text-yellow-600 animate-spin" />;
      case 'closed':
      default:
        return <WifiOff className="h-3 w-3 text-gray-400" />;
    }
  };

  if (!shouldShowConsole) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-900 ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-t">
        <div className="flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 animate-spin" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Training Status
          </span>
          {(currentTask || isTraining) && (
            getStatusBadge(currentTask ? currentTask.hasOwnProperty('status') ? currentTask.status : "training" : "training")
          )}
          
          {/* Polling Connection Status */}
          <div className="flex items-center gap-1 ml-2" title={`Polling: ${connectionStatus}`}>
            {getConnectionIcon()}
            <span className="text-xs text-gray-500">{connectionStatus}</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-5 w-5 transition-opacity dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-40px)]">
        <div className="p-0">
          {/* Console Content */}
          {isExpanded && (
            <div className="p-4 max-h-60">
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
                        <span className="font-medium text-gray-600 dark:text-gray-400">Status: </span>
                        {getStatusBadge(currentTask.status)}
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Started:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {formatTimestamp(currentTask.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Task ID:</span>
                          <div className="font-mono text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 px-2 py-1 rounded border break-all">
                            {currentTask.taskId}
                          </div>
                        </div>
                        <ModernButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTaskId(currentTask.taskId)}
                          className="ml-2 h-8 w-8 p-2"
                          title="Copy Task ID"
                          iconOnly
                        >
                          {copiedTaskId === currentTask.taskId ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </ModernButton>
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
      </ScrollArea>
    </div>
  );
};
