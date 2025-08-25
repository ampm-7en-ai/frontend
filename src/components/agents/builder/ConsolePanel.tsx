
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check, LoaderCircle, Wifi, WifiOff, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string>('');
  
  // Updated progress tracking based on your example
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Connecting to training stream...');
  const [currentPhase, setCurrentPhase] = useState<'connecting' | 'extracting' | 'embedding' | 'completed' | 'failed'>('connecting');
  const [isCompleted, setIsCompleted] = useState(false);
  const lastEventRef = useRef<string | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { state } = useBuilder();
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Only show console panel if CURRENT agent is training
  const shouldShowConsole = state.agentData.status === 'Training' || currentTask?.status === 'training' || isTraining;

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

  // Updated event processing based on your example logic
  useEffect(() => {
    const updateEventLogs = () => {
      if (agentId) {
        const logs = trainingSSEService.getRecentEventLogs(agentId, 10);
        setEventLogs(logs);
        
        // Process the latest event with your logic
        const latestEvent = logs[0];
        if (latestEvent) {
          const eventData = latestEvent.event.data;
          const eventType = latestEvent.event.event;

          // Filter duplicate events
          const eventKey = `${eventType}-${JSON.stringify(eventData)}`;
          if (eventKey === lastEventRef.current) return;
          lastEventRef.current = eventKey;

          if (eventType === 'training_connected') {
            setProgress(0);
            setStatusMessage('Connected to training stream');
            setCurrentPhase('connecting');
            setCurrentTaskStatus('training');
            setIsCompleted(false);
          } else if (eventType === 'training_progress') {
            // Handle training_training event (renamed to training_progress in our system)
            const message = eventData.message || 'Processing...';
            const progressValue = eventData.progress || 0;
            
            // Determine phase based on progress value or message content
            if (message.toLowerCase().includes('extract') || progressValue <= 50) {
              setCurrentPhase('extracting');
              // Progress from 10% to 50% during extraction
              const adjustedProgress = Math.max(10, Math.min(progressValue, 50));
              setProgress(adjustedProgress);
              setStatusMessage(message);
            } else if (message.toLowerCase().includes('embed') || progressValue > 50) {
              setCurrentPhase('embedding');
              // Progress from 50% to 90% during embedding
              const adjustedProgress = Math.max(50, Math.min(progressValue, 90));
              setProgress(adjustedProgress);
              setStatusMessage(message);
            } else {
              setProgress(progressValue);
              setStatusMessage(message);
            }
            
            setCurrentTaskStatus('training');
          } else if (eventType === 'training_completed') {
            setProgress(100);
            setStatusMessage('Training completed successfully');
            setCurrentPhase('completed');
            setCurrentTaskStatus('completed');
            setIsCompleted(true);
          } else if (eventType === 'training_failed') {
            setCurrentPhase('failed');
            setStatusMessage(eventData.error || 'Training failed');
            setCurrentTaskStatus('failed');
          }
        }
      }
    };

    // Update immediately
    updateEventLogs();
    
    // Update every 1 second to catch new events
    const interval = setInterval(updateEventLogs, 1000);
    
    return () => clearInterval(interval);
  }, [agentId]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollAreaRef.current && eventLogs.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [eventLogs]);

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

  // Get phase-specific display info
  const getPhaseDisplayInfo = () => {
    switch (currentPhase) {
      case 'connecting':
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: 0,
          embeddingProgress: 0
        };
      case 'extracting':
        return {
          extractingActive: true,
          embeddingActive: false,
          extractingProgress: Math.min(progress * 2, 100), // Scale to 0-100% for extraction step
          embeddingProgress: 0
        };
      case 'embedding':
        return {
          extractingActive: false,
          embeddingActive: true,
          extractingProgress: 100,
          embeddingProgress: Math.min((progress - 50) * 2, 100) // Scale remaining progress for embedding
        };
      case 'completed':
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: 100,
          embeddingProgress: 100
        };
      case 'failed':
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: progress >= 25 ? 100 : 0,
          embeddingProgress: progress >= 75 ? 100 : 0
        };
      default:
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: 0,
          embeddingProgress: 0
        };
    }
  };

  const phaseInfo = getPhaseDisplayInfo();

  // Mock data for character counts (since backend doesn't provide this yet)
  const mockCharacterCounts = {
    total: 134666,
    sources: [
      { name: 'Source 1', count: 134666 },
      { name: 'Source 2', count: 134666 },
      { name: 'Source 3', count: 134666 }
    ]
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
          
          {/* Main Progress Display */}
          <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Training Progress
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-gray-600 dark:text-gray-400">{statusMessage}</p>
            </div>

            {/* Step-wise Progress */}
            <div className="space-y-3">
              {/* Extracting Characters Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {phaseInfo.extractingActive ? (
                    <LoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : phaseInfo.extractingProgress === 100 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Extracting Characters
                  </span>
                </div>
                <Progress value={phaseInfo.extractingProgress} className="h-2" />
              </div>

              {/* Embedding Characters Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {phaseInfo.embeddingActive ? (
                    <LoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : phaseInfo.embeddingProgress === 100 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Embedding Characters
                  </span>
                </div>
                <Progress value={phaseInfo.embeddingProgress} className="h-2" />
              </div>
            </div>

            {/* Done Section */}
            {isCompleted && (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Done
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="font-medium">
                    Total Characters: <span className="text-gray-900 dark:text-gray-100">{mockCharacterCounts.total.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {mockCharacterCounts.sources.map((source, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{source.name}:</span>
                        <span className="text-gray-900 dark:text-gray-100">{source.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Event Log (Collapsed when completed) */}
            {!isCompleted && eventLogs.length > 0 && (
              <div className="flex-1 min-h-0">
                <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Events
                    </span>
                    <Badge variant="outline" className="text-xs h-4">
                      {eventLogs.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b">
                  <ScrollArea className="h-24" ref={scrollAreaRef}>
                    <div className="p-2 space-y-1">
                      {eventLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-[10px]">
                              {log.event.event.replace('training_', '')}
                            </span>
                            {log.event.data.progress && (
                              <span className="text-blue-600 dark:text-blue-400 text-[10px]">
                                {log.event.data.progress}%
                              </span>
                            )}
                            {log.event.data.message && (
                              <span className="text-gray-600 dark:text-gray-400 truncate text-[10px]">
                                - {log.event.data.message}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 text-[9px] whitespace-nowrap">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
