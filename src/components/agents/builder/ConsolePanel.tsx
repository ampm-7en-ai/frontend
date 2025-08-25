
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check, LoaderCircle, Wifi, WifiOff, Activity, Clock, FileText, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
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
  
  // Enhanced progress tracking based on actual SSE data structure
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Connecting to training stream...');
  const [currentPhase, setCurrentPhase] = useState<'connecting' | 'extracting' | 'embedding' | 'completed' | 'failed'>('connecting');
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSource, setCurrentSource] = useState<any>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [chunkInfo, setChunkInfo] = useState<string>('');
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

  // Enhanced event processing based on actual SSE data structure
  useEffect(() => {
    const updateEventLogs = () => {
      if (agentId) {
        const logs = trainingSSEService.getRecentEventLogs(agentId, 10);
        setEventLogs(logs);
        
        // Process the latest event with actual data structure
        const latestEvent = logs[0];
        if (latestEvent) {
          const eventData = latestEvent.event.data;
          const eventType = latestEvent.event.event;

          // Filter duplicate events more precisely
          const eventKey = `${eventType}-${eventData.status}-${JSON.stringify(eventData.train_data)}`;
          if (eventKey === lastEventRef.current) return;
          lastEventRef.current = eventKey;

          if (eventType === 'training_connected') {
            setProgress(5);
            setStatusMessage('Connected to training stream');
            setCurrentPhase('connecting');
            setIsCompleted(false);
            setCurrentSource(null);
            setProcessedCount(0);
            setTotalCount(0);
            setChunkInfo('');
          } else if (eventType === 'training_progress' && eventData.train_data) {
            const trainData = eventData.train_data;
            const { phase, message, processed_count = 0, total_count = 0, current_source } = trainData;
            
            setProcessedCount(processed_count);
            setTotalCount(total_count);
            setCurrentSource(current_source);
            setStatusMessage(message || 'Processing...');

            if (phase === 'extracting') {
              setCurrentPhase('extracting');
              // Progress from 10% to 50% during extraction
              if (total_count > 0) {
                const extractionProgress = processed_count / total_count;
                const progressValue = 10 + extractionProgress * 40; // 10% to 50%
                setProgress(Math.min(progressValue, 50));
              } else {
                setProgress(25); // Default progress when no count available
              }
            } else if (phase === 'embedding_start') {
              setCurrentPhase('embedding');
              setProgress(55); // Start embedding at 55%
              
              // Extract chunk information from message
              const chunkMatch = message?.match(/(\d+)\s+chunks/);
              if (chunkMatch) {
                setChunkInfo(`Processing ${chunkMatch[1]} text chunks`);
              }
            }
          } else if (eventType === 'training_completed' && eventData.train_data) {
            const trainData = eventData.train_data;
            if (trainData.phase === 'embedding_completed') {
              setProgress(100);
              setStatusMessage('Training completed successfully');
              setCurrentPhase('completed');
              setIsCompleted(true);
            }
          } else if (eventType === 'training_failed') {
            setCurrentPhase('failed');
            setStatusMessage(eventData.error || 'Training failed');
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
          embeddingProgress: 0,
          extractingCompleted: false,
          embeddingCompleted: false
        };
      case 'extracting':
        return {
          extractingActive: true,
          embeddingActive: false,
          extractingProgress: Math.min((progress - 10) * 2.5, 100), // Scale 10-50% to 0-100%
          embeddingProgress: 0,
          extractingCompleted: false,
          embeddingCompleted: false
        };
      case 'embedding':
        return {
          extractingActive: false,
          embeddingActive: true,
          extractingProgress: 100,
          embeddingProgress: Math.min((progress - 55) * 2.22, 100), // Scale 55-100% to 0-100%
          extractingCompleted: true,
          embeddingCompleted: false
        };
      case 'completed':
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: 100,
          embeddingProgress: 100,
          extractingCompleted: true,
          embeddingCompleted: true
        };
      case 'failed':
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: progress >= 25 ? 100 : 0,
          embeddingProgress: progress >= 75 ? 100 : 0,
          extractingCompleted: false,
          embeddingCompleted: false
        };
      default:
        return {
          extractingActive: false,
          embeddingActive: false,
          extractingProgress: 0,
          embeddingProgress: 0,
          extractingCompleted: false,
          embeddingCompleted: false
        };
    }
  };

  const phaseInfo = getPhaseDisplayInfo();

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
        <div className="flex flex-col h-96">
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

            {/* Current Source Display */}
            {currentSource && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Processing Source
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    {currentSource.title || 'Untitled Source'}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    Type: {currentSource.type} • ID: {currentSource.id}
                  </div>
                  {currentSource.source && (
                    <div className="text-xs text-blue-500 dark:text-blue-400 font-mono truncate">
                      {currentSource.source}
                    </div>
                  )}
                </div>
                {totalCount > 0 && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    Progress: {processedCount} / {totalCount} sources
                  </div>
                )}
              </div>
            )}

            {/* Step-wise Progress - Windows Installation Style */}
            <div className="space-y-3">
              {/* Extracting Characters Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {phaseInfo.extractingActive ? (
                    <LoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : phaseInfo.extractingCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Extracting Text Content
                  </span>
                  {phaseInfo.extractingActive && currentSource && (
                    <Badge variant="outline" className="text-xs">
                      {processedCount}/{totalCount}
                    </Badge>
                  )}
                </div>
                <Progress value={phaseInfo.extractingProgress} className="h-2" />
                {phaseInfo.extractingActive && currentSource && (
                  <div className="text-xs text-gray-500 ml-6">
                    Processing: {currentSource.title || 'Source'}
                  </div>
                )}
              </div>

              {/* Embedding Characters Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {phaseInfo.embeddingActive ? (
                    <Zap className="h-4 w-4 text-purple-600 animate-pulse" />
                  ) : phaseInfo.embeddingCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Generating AI Embeddings
                  </span>
                  {phaseInfo.embeddingActive && chunkInfo && (
                    <Badge variant="outline" className="text-xs">
                      AI Processing
                    </Badge>
                  )}
                </div>
                <Progress value={phaseInfo.embeddingProgress} className="h-2" />
                {phaseInfo.embeddingActive && chunkInfo && (
                  <div className="text-xs text-gray-500 ml-6">
                    {chunkInfo}
                  </div>
                )}
              </div>
            </div>

            {/* Completion Section */}
            {isCompleted && (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Training Complete
                  </span>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    <div className="font-medium">
                      Successfully processed {totalCount} knowledge source{totalCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Your agent is now ready to use with the updated knowledge base
                    </div>
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
                      Live Events
                    </span>
                    <Badge variant="outline" className="text-xs h-4">
                      {eventLogs.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b">
                  <ScrollArea className="h-32" ref={scrollAreaRef}>
                    <div className="p-2 space-y-1">
                      {eventLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-[10px]">
                              {log.event.event.replace('training_', '')}
                            </span>
                            {log.event.data.train_data?.phase && (
                              <span className="text-blue-600 dark:text-blue-400 text-[10px]">
                                {log.event.data.train_data.phase}
                              </span>
                            )}
                            {log.event.data.train_data?.message && (
                              <span className="text-gray-600 dark:text-gray-400 truncate text-[10px]">
                                - {log.event.data.train_data.message}
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
