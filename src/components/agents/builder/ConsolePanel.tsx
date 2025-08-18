
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check, LoaderCircle, Wifi, WifiOff, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { trainingSSEService, SSEEventLog } from '@/services/TrainingSSEService';
import { useBuilder } from '@/components/agents/builder/BuilderContext';
import ModernButton from '@/components/dashboard/ModernButton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsolePanelProps {
  className?: string;
  isTraining?: boolean;
  refetchAgentData?: () => Promise<void>;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false, refetchAgentData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const [eventLogs, setEventLogs] = useState<SSEEventLog[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { state } = useBuilder();
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Subscribe to SSE connection status
  useEffect(() => {
    const statusCallback = (status: 'connecting' | 'open' | 'closed') => {
      setConnectionStatus(status);
    };

    trainingSSEService.subscribeToConnectionStatus(statusCallback);
    
    // Get initial status
    setConnectionStatus(trainingSSEService.getConnectionStatus());

    return () => {
      trainingSSEService.unsubscribeFromConnectionStatus(statusCallback);
    };
  }, []);

  // Update event logs periodically
  useEffect(() => {
    const updateEventLogs = () => {
      if (agentId) {
        const logs = trainingSSEService.getRecentEventLogs(agentId, 10);
        setEventLogs(logs);
      }
    };

    // Update immediately
    updateEventLogs();
    
    // Update every 2 seconds to catch new events
    const interval = setInterval(updateEventLogs, 2000);
    
    return () => clearInterval(interval);
  }, [agentId]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [eventLogs]);

  // Force re-render when task status might have changed
  useEffect(() => {
    if (currentTask) {
      const interval = setInterval(() => {
        setForceUpdate(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentTask]);

  const shouldShowConsole = currentTask || isTraining || connectionStatus === 'open';

  const handleCopyTaskId = async (taskId: string) => {
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedTaskId(taskId);
      setTimeout(() => setCopiedTaskId(null), 2000);
    } catch (error) {
      console.error('Failed to copy task ID:', error);
    }
  };

  const formatTimestamp = (timestamp: number | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString();
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

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'training_connected':
        return <Wifi className="h-3 w-3 text-blue-600" />;
      case 'training_progress':
        return <Activity className="h-3 w-3 text-orange-600" />;
      case 'training_completed':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'training_failed':
        return <Terminal className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'training_connected':
        return 'Connected';
      case 'training_progress':
        return 'Progress';
      case 'training_completed':
        return 'Completed';
      case 'training_failed':
        return 'Failed';
      default:
        return eventType;
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
            Training Console
          </span>
          {(currentTask || isTraining) && (
            getStatusBadge(currentTask ? currentTask.status : "training")
          )}
          
          {/* SSE Connection Status */}
          <div className="flex items-center gap-1 ml-2" title={`SSE Connection: ${connectionStatus}`}>
            {getConnectionIcon()}
            <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
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
      
      {isExpanded && (
        <div className="flex flex-col h-80">
          {/* Task Information */}
          {currentTask && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Card className="p-3 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {currentTask.agentName}
                    </h4>
                    {getStatusBadge(currentTask.status)}
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Started: {formatTimestamp(currentTask.timestamp)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 px-2 py-1 rounded border break-all flex-1 mr-2">
                      {currentTask.taskId}
                    </div>
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyTaskId(currentTask.taskId)}
                      className="h-6 w-6 p-1"
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
              </Card>
            </div>
          )}
          
          {/* Real-time Event Log */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Real-time Events
                </span>
                <Badge variant="outline" className="text-xs">
                  {eventLogs.length}
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="p-4 space-y-2">
                {eventLogs.length > 0 ? (
                  eventLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {getEventTypeIcon(log.event.event)}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getEventTypeLabel(log.event.event)}
                        </span>
                        {log.event.data.progress && (
                          <span className="text-blue-600 dark:text-blue-400">
                            {log.event.data.progress}%
                          </span>
                        )}
                        {log.event.data.message && (
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            - {log.event.data.message}
                          </span>
                        )}
                        {log.event.data.error && (
                          <span className="text-red-600 dark:text-red-400 truncate">
                            - {log.event.data.error}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-[10px] whitespace-nowrap">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events yet</p>
                    <p className="text-xs mt-1">
                      {connectionStatus === 'open' ? 'Waiting for training events...' : 'Connect to see real-time events'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};
