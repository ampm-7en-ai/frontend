
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Terminal, Copy, Check, LoaderCircle, Wifi, WifiOff, Activity, Clock, FileText, Zap, CheckCircle2, AlertCircle, Globe, Upload } from 'lucide-react';
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

interface ProcessedSource {
  id: number;
  title: string;
  type: string;
  source: string;
  status: 'pending' | 'active' | 'completed';
  animationDelay?: number;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false, refetchAgentData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const [eventLogs, setEventLogs] = useState<SSEEventLog[]>([]);
  
  // Enhanced progress tracking
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Connecting to training stream...');
  const [currentPhase, setCurrentPhase] = useState<'connecting' | 'extracting' | 'embedding' | 'completed' | 'failed'>('connecting');
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSource, setCurrentSource] = useState<any>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [chunkInfo, setChunkInfo] = useState<string>('');
  const [allSources, setAllSources] = useState<ProcessedSource[]>([]);
  const [embeddingProgress, setEmbeddingProgress] = useState({ current: 0, total: 0 });
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

  // Enhanced event processing
  useEffect(() => {
    const updateEventLogs = () => {
      if (agentId) {
        const logs = trainingSSEService.getRecentEventLogs(agentId, 10);
        setEventLogs(logs);
        
        // Process the latest event
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
            setAllSources([]);
          } else if (eventType === 'training_progress' && eventData.train_data) {
            const trainData = eventData.train_data;
            const { phase, message, processed_count = 0, total_count = 0, current_source } = trainData;
            
            setProcessedCount(processed_count);
            setTotalCount(total_count);
            setCurrentSource(current_source);
            setStatusMessage(message || 'Processing...');

            if (phase === 'extracting') {
              setCurrentPhase('extracting');
              
              // Build sources list for juggling effect
              if (current_source && !allSources.find(s => s.id === current_source.id)) {
                setAllSources(prev => {
                  const newSources = [...prev];
                  const existingIndex = newSources.findIndex(s => s.id === current_source.id);
                  
                  if (existingIndex === -1) {
                    newSources.push({
                      id: current_source.id,
                      title: current_source.title,
                      type: current_source.type,
                      source: current_source.source,
                      status: 'active',
                      animationDelay: newSources.length * 150
                    });
                  } else {
                    newSources[existingIndex].status = 'active';
                  }
                  
                  // Mark previous sources as completed
                  newSources.forEach((source, index) => {
                    if (source.id !== current_source.id && source.status === 'active') {
                      source.status = 'completed';
                    }
                  });
                  
                  return newSources;
                });
              }

              // Progress from 10% to 50% during extraction
              if (total_count > 0) {
                const extractionProgress = processed_count / total_count;
                const progressValue = 10 + extractionProgress * 40; // 10% to 50%
                setProgress(Math.min(progressValue, 50));
              } else {
                setProgress(25); // Default progress when no count available
              }
            } else if (phase === 'extraction_completed') {
              // Mark all sources as completed
              setAllSources(prev => prev.map(source => ({ ...source, status: 'completed' })));
              setProgress(50);
            } else if (phase === 'embedding_start') {
              setCurrentPhase('embedding');
              setProgress(55); // Start embedding at 55%
              
              // Extract chunk information from message
              const chunkMatch = message?.match(/(\d+)\s+chunks/);
              if (chunkMatch) {
                const totalChunks = parseInt(chunkMatch[1]);
                setChunkInfo(`Processing ${totalChunks} text chunks with AI embeddings`);
                setEmbeddingProgress({ current: 0, total: totalChunks });
              }
            }
          } else if (eventType === 'training_completed' && eventData.train_data) {
            const trainData = eventData.train_data;
            if (trainData.phase === 'embedding_completed') {
              setProgress(100);
              setStatusMessage('Training completed successfully');
              setCurrentPhase('completed');
              setIsCompleted(true);
              setEmbeddingProgress(prev => ({ ...prev, current: prev.total }));
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
    
    // Update every 500ms for smoother animations
    const interval = setInterval(updateEventLogs, 500);
    
    return () => clearInterval(interval);
  }, [agentId, allSources]);

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

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'docs':
        return <FileText className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getSourceDisplayName = (source: ProcessedSource) => {
    if (source.type === 'website') {
      try {
        return new URL(source.source).hostname;
      } catch {
        return source.title || source.source;
      }
    }
    return source.title || source.source.split('/').pop() || 'Unknown Source';
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

            {/* Source Juggling Display */}
            {currentPhase === 'extracting' && allSources.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Extracting Knowledge Sources
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {processedCount}/{totalCount}
                  </Badge>
                </div>
                
                {/* Juggling Sources */}
                <div className="space-y-2 max-h-32 overflow-hidden">
                  {allSources.map((source, index) => (
                    <div 
                      key={source.id}
                      className={`
                        flex items-center gap-3 p-2 rounded-md transition-all duration-500 transform
                        ${source.status === 'active' 
                          ? 'bg-blue-100 dark:bg-blue-900/40 scale-105 opacity-100 border-l-4 border-blue-500' 
                          : source.status === 'completed'
                          ? 'bg-green-50 dark:bg-green-900/20 scale-95 opacity-75 border-l-4 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-800/50 scale-95 opacity-50'
                        }
                      `}
                      style={{
                        animationDelay: `${source.animationDelay || 0}ms`,
                        animation: source.status === 'active' ? 'pulse 2s infinite' : 'none'
                      }}
                    >
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full
                        ${source.status === 'active' 
                          ? 'bg-blue-500 text-white' 
                          : source.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                        }
                      `}>
                        {source.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          getSourceIcon(source.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {getSourceDisplayName(source)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {source.type} • {source.source}
                        </div>
                      </div>
                      {source.status === 'active' && (
                        <LoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedding Phase */}
            {currentPhase === 'embedding' && chunkInfo && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    AI Embedding Generation
                  </span>
                  <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/40">
                    AI Processing
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    {chunkInfo}
                  </div>
                  
                  {/* Animated embedding progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-purple-200 dark:bg-purple-800/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                        style={{ width: `${phaseInfo.embeddingProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                      {Math.round(phaseInfo.embeddingProgress)}%
                    </span>
                  </div>
                  
                  {/* Floating AI particles animation */}
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step-wise Progress */}
            <div className="space-y-3">
              {/* Extracting Step */}
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
                    Extract Text Content
                  </span>
                  {phaseInfo.extractingActive && (
                    <Badge variant="outline" className="text-xs">
                      {allSources.filter(s => s.status === 'completed').length}/{allSources.length}
                    </Badge>
                  )}
                </div>
                <Progress value={phaseInfo.extractingProgress} className="h-2" />
              </div>

              {/* Embedding Step */}
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
                    Generate AI Embeddings
                  </span>
                  {phaseInfo.embeddingActive && (
                    <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/40">
                      AI Processing
                    </Badge>
                  )}
                </div>
                <Progress value={phaseInfo.embeddingProgress} className="h-2" />
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
                      Your agent is now ready with the updated knowledge base
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
