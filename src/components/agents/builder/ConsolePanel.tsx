import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Terminal, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { trainingSSEService, SSEEventLog } from '@/services/TrainingSSEService';
import { useBuilder } from '@/components/agents/builder/BuilderContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SourceTracker, createSourceTracker, ProgressState } from './utils/sourceTrackingUtils';
import { formatProgressDisplay, formatSourceName, getPhaseMessage, createProgressBar } from './utils/progressDisplayUtils';

interface ConsolePanelProps {
  className?: string;
  isTraining?: boolean;
  refetchAgentData?: () => Promise<void>;
}

interface TerminalLine {
  id: string;
  content: string;
  type: 'command' | 'output' | 'success' | 'warning' | 'error' | 'info' | 'system';
  timestamp: Date;
  prefix?: string;
}

interface EmbeddingProgress {
  startTime: number;
  totalChunks: number;
  chunkProcessingTimeMs: number; // ~228ms per chunk (50 seconds / 219 chunks)
  processedChunks: number;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false, refetchAgentData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [sourceTracker, setSourceTracker] = useState<SourceTracker | null>(null);
  const [embeddingProgress, setEmbeddingProgress] = useState<EmbeddingProgress | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const lastProcessedTimestampRef = useRef<number>(0);
  const embeddingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { state } = useBuilder();
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Only show console panel if CURRENT agent is training
  const shouldShowConsole = state.agentData.status === 'Training' || currentTask?.status === 'training' || isTraining;

  // Initialize source tracker when knowledge sources are available
  useEffect(() => {
    if (state.agentData.knowledgeSources.length > 0) {
      const tracker = createSourceTracker(state.agentData.knowledgeSources);
      setSourceTracker(tracker);
      console.log('🎯 Initialized source tracker with sources:', tracker.getProgressState());
    }
  }, [state.agentData.knowledgeSources]);

  // Cleanup embedding interval on unmount
  useEffect(() => {
    return () => {
      if (embeddingIntervalRef.current) {
        clearInterval(embeddingIntervalRef.current);
      }
    };
  }, []);

  // Add a terminal line
  const addTerminalLine = (content: string, type: TerminalLine['type'], prefix?: string) => {
    const newLine: TerminalLine = {
      id: `${Date.now()}-${Math.random()}`,
      content,
      type,
      timestamp: new Date(),
      prefix
    };
    
    setTerminalLines(prev => [...prev, newLine]);
  };

  // Start embedding progress simulation based on actual chunk processing rate
  const startEmbeddingProgress = (totalChunks: number) => {
    // Based on actual performance: 219 chunks = 50-60 seconds
    // Average: 55 seconds / 219 chunks = ~251ms per chunk
    const chunkProcessingTimeMs = 251; 
    const startTime = Date.now();
    
    setEmbeddingProgress({
      startTime,
      totalChunks,
      chunkProcessingTimeMs,
      processedChunks: 0
    });

    // Clear any existing interval
    if (embeddingIntervalRef.current) {
      clearInterval(embeddingIntervalRef.current);
    }

    // Update progress every 3 seconds to show realistic progression
    embeddingIntervalRef.current = setInterval(() => {
      setEmbeddingProgress(prev => {
        if (!prev) return null;
        
        const elapsed = Date.now() - prev.startTime;
        const expectedProcessedChunks = Math.floor(elapsed / prev.chunkProcessingTimeMs);
        const actualProcessedChunks = Math.min(expectedProcessedChunks, prev.totalChunks - 1); // Cap at total-1 until completion
        const progress = (actualProcessedChunks / prev.totalChunks) * 100;
        
        if (actualProcessedChunks < prev.totalChunks - 1) {
          const progressBar = createProgressBar(progress);
          const remainingChunks = prev.totalChunks - actualProcessedChunks;
          const remainingTimeMs = remainingChunks * prev.chunkProcessingTimeMs;
          const remainingSeconds = Math.ceil(remainingTimeMs / 1000);
          
          // Format ETA display
          let etaText = '';
          if (remainingSeconds > 60) {
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            etaText = `${minutes}min ${seconds}sec`;
          } else {
            etaText = `${remainingSeconds}sec`;
          }
          
          // Update the last embedding progress line - using reverse iteration instead of findLastIndex
          setTerminalLines(prevLines => {
            const newLines = [...prevLines];
            let lastProgressIndex = -1;
            
            // Find the last progress line by iterating backwards
            for (let i = newLines.length - 1; i >= 0; i--) {
              if (newLines[i].content.includes('Generating embeddings') || newLines[i].content.includes('[█')) {
                lastProgressIndex = i;
                break;
              }
            }
            
            if (lastProgressIndex !== -1 && newLines[lastProgressIndex].content.includes('[█')) {
              // Update existing progress line
              newLines[lastProgressIndex] = {
                ...newLines[lastProgressIndex],
                content: `[${progressBar}] ${Math.floor(progress)}% complete (${actualProcessedChunks}/${prev.totalChunks} chunks) - ETA: ${etaText}`,
                timestamp: new Date()
              };
            } else {
              // Add new progress line
              newLines.push({
                id: `${Date.now()}-progress`,
                content: `[${progressBar}] ${Math.floor(progress)}% complete (${actualProcessedChunks}/${prev.totalChunks} chunks) - ETA: ${etaText}`,
                type: 'info',
                timestamp: new Date(),
                prefix: '[EMB]'
              });
            }
            
            return newLines;
          });
        }
        
        return {
          ...prev,
          processedChunks: actualProcessedChunks
        };
      });
    }, 3000); // Update every 3 seconds for smoother updates
  };

  // Stop embedding progress
  const stopEmbeddingProgress = () => {
    if (embeddingIntervalRef.current) {
      clearInterval(embeddingIntervalRef.current);
      embeddingIntervalRef.current = null;
    }
    setEmbeddingProgress(null);
  };

  // Enhanced event processing with better duplicate detection
  useEffect(() => {
    if (!agentId || !sourceTracker) return;

    const updateEventLogs = () => {
      const logs = trainingSSEService.getRecentEventLogs(agentId, 20);
      
      // Process only new events since last timestamp
      const newEvents = logs.filter(log => 
        log.timestamp.getTime() > lastProcessedTimestampRef.current
      );

      if (newEvents.length === 0) return;

      // Sort by timestamp to process in correct order
      newEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      newEvents.forEach(eventLog => {
        const { event } = eventLog;
        const eventData = event.data;
        const eventType = event.event;

        // Create unique event key without timestamp to avoid duplicates
        const eventKey = `${eventType}-${eventData.status}-${eventData.train_data?.phase}-${eventData.train_data?.current_source?.id || 'none'}`;
        
        if (processedEventsRef.current.has(eventKey)) return;
        processedEventsRef.current.add(eventKey);

        console.log('🎯 Processing new SSE event:', eventType, eventData);

        if (eventType === 'training_connected') {
          // Clear terminal and reset source tracker
          setTerminalLines([]);
          sourceTracker.reset();
          processedEventsRef.current.clear();
          processedEventsRef.current.add(eventKey);
          stopEmbeddingProgress(); // Clear any existing embedding progress
          
          addTerminalLine('╔═══════════════════════════════════════════════════════════════════════╗', 'system');
          addTerminalLine('║                     7EN AI Training Terminal v2.1                    ║', 'system');
          addTerminalLine('╚═══════════════════════════════════════════════════════════════════════╝', 'system');
          addTerminalLine('', 'output');
          addTerminalLine('🚀 Initializing agent training environment...', 'info', '[INIT]');
          addTerminalLine(`✓ Connected to agent-${agentId}`, 'success', '[CONN]');
          addTerminalLine('', 'output');
          setCurrentPhase('connecting');
          setIsCompleted(false);
        } else if (eventType === 'training_progress' && eventData.train_data) {
          const trainData = eventData.train_data;
          const { phase, message, current_source } = trainData;
          
          setCurrentPhase(phase);

          if (phase === 'extracting') {
            if (message?.includes('Starting text extraction')) {
              const progressState = sourceTracker.getProgressState();
              addTerminalLine('$ sudo apt-get update && apt-get install knowledge-extractor', 'command');
              addTerminalLine('Reading sources lists... Done', 'output');
              addTerminalLine(`Found ${progressState.totalSources} knowledge source(s) to process`, 'info');
              addTerminalLine('', 'output');
              addTerminalLine('The following sources will be extracted:', 'output');
              addTerminalLine(`  knowledge-sources (${progressState.totalSources} sources)`, 'output');
              addTerminalLine('', 'output');
            } else if (current_source?.id) {
              // Update source tracker with current source
              const sourceFromTracker = sourceTracker.getSourceById(current_source.id);
              
              if (sourceFromTracker) {
                // Mark current source as active
                sourceTracker.updateSourceStatus(current_source.id, 'active');
                
                // Get accurate progress
                const progress = sourceTracker.getCurrentProgress();
                const sourceName = formatSourceName(sourceFromTracker);
                
                // Display progress with accurate position
                const progressDisplay = formatProgressDisplay(
                  progress.current,
                  progress.total,
                  progress.percentage,
                  sourceName
                );
                
                addTerminalLine(progressDisplay.currentText, 'info');
                addTerminalLine(progressDisplay.progressBar, 'output');
                
                console.log('📊 Source progress update:', {
                  sourceId: current_source.id,
                  sourceName: sourceFromTracker.title,
                  position: sourceFromTracker.position,
                  progress: progress
                });
              }
            }
          } else if (phase === 'extraction_completed') {
            // Mark current source as completed
            const currentSource = sourceTracker.getCurrentSource();
            if (currentSource) {
              sourceTracker.updateSourceStatus(currentSource.id, 'completed');
              const completionProgress = sourceTracker.getCompletionProgress();
              
              addTerminalLine('', 'output');
              addTerminalLine('✓ Text extraction completed successfully', 'success');
              addTerminalLine(`✓ Processed ${completionProgress.completed}/${completionProgress.total} knowledge sources`, 'success');
              addTerminalLine('', 'output');
            }
          } else if (phase === 'embedding_start') {
            const chunkMatch = message?.match(/(\d+)\s+chunks/);
            const totalChunks = chunkMatch ? parseInt(chunkMatch[1]) : 1000; // Default fallback
            
            addTerminalLine('$ 7en embed --upgrade ai-embeddings-engine', 'command');
            addTerminalLine('Collecting ai-embeddings-engine', 'output');
            addTerminalLine('  Using cached ai_embeddings_engine-3.0.0.tgz', 'output');
            addTerminalLine(`Generating embeddings for ${totalChunks} text chunks`, 'info', '[EMB]');
            addTerminalLine(`This process may take upto ${Math.round((totalChunks*0.25)/60)} minutes...`, 'info', '[EMB]');
            addTerminalLine('', 'output');
            
            // Start the embedding progress simulation
            startEmbeddingProgress(totalChunks);
          }
        } else if (eventType === 'training_completed' && eventData.train_data) {
          const trainData = eventData.train_data;
          if (trainData.phase === 'embedding_completed') {
            // Stop embedding progress and show completion
            stopEmbeddingProgress();
            
            addTerminalLine('', 'output');
            addTerminalLine('[████████████████████] 100% complete', 'success', '[EMB]');
            addTerminalLine('✓ AI embedding generation completed', 'success');
            addTerminalLine('✓ Knowledge base updated successfully', 'success');
            addTerminalLine('✓ Agent training pipeline finished', 'success');
            addTerminalLine('', 'output');
            addTerminalLine('╔═══════════════════════════════════════════════════════════════════════╗', 'system');
            addTerminalLine('║                     🎉 TRAINING COMPLETED 🎉                         ║', 'success');
            addTerminalLine('╚═══════════════════════════════════════════════════════════════════════╝', 'system');
            addTerminalLine('', 'output');
            addTerminalLine('Agent is ready for deployment. Exiting...', 'success');
            
            setCurrentPhase('completed');
            setIsCompleted(true);
            
            // Refetch agent data and clear floating loader
            if (refetchAgentData) {
              setTimeout(() => {
                refetchAgentData().then(() => {
                  // The refetch should update the agent status, which will hide the console
                }).catch(error => {
                  console.error('Error refetching agent data:', error);
                });
              }, 1000);
            }
          }
        } else if (eventType === 'training_failed') {
          // Stop embedding progress on failure
          stopEmbeddingProgress();
          
          addTerminalLine('', 'output');
          addTerminalLine('✗ Training process failed', 'error');
          addTerminalLine(eventData.error || 'Unknown error occurred', 'error');
          addTerminalLine('', 'output');
          addTerminalLine('Process exited with code 1', 'error');
          setCurrentPhase('failed');
          
          // Clear floating loader on failure too
          if (refetchAgentData) {
            setTimeout(() => {
              refetchAgentData().catch(error => {
                console.error('Error refetching agent data:', error);
              });
            }, 1000);
          }
        }
      });

      // Update last processed timestamp
      if (newEvents.length > 0) {
        lastProcessedTimestampRef.current = Math.max(...newEvents.map(e => e.timestamp.getTime()));
      }
    };

    updateEventLogs();
    const interval = setInterval(updateEventLogs, 1000); // Check every second
    return () => clearInterval(interval);
  }, [agentId, refetchAgentData, sourceTracker]);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [terminalLines]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-green-400';
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-300';
      case 'system':
        return 'text-cyan-300';
      default:
        return 'text-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0];
  };

  // Get current progress for minimized state
  const getCurrentProgressText = () => {
    if (!sourceTracker) return 'Training in progress...';
    
    const progress = sourceTracker.getCurrentProgress();
    const completionProgress = sourceTracker.getCompletionProgress();

    if (currentPhase === 'extracting') {
      return `Extracting sources... [${completionProgress.completed}/${progress.total}]`;
    } else if (currentPhase === 'embedding_start' || currentPhase === 'embedding') {
      if (embeddingProgress) {
        const elapsed = Date.now() - embeddingProgress.startTime;
        const expectedProcessedChunks = Math.floor(elapsed / embeddingProgress.chunkProcessingTimeMs);
        const actualProcessedChunks = Math.min(expectedProcessedChunks, embeddingProgress.totalChunks - 1);
        const progressPercentage = (actualProcessedChunks / embeddingProgress.totalChunks) * 100;
        return `Generating embeddings... ${Math.floor(progressPercentage)}% (${actualProcessedChunks}/${embeddingProgress.totalChunks})`;
      }
      return 'Generating AI embeddings...';
    } else if (currentPhase === 'completed') {
      return 'Training completed ✓';
    } else {
      return 'Training in progress...';
    }
  };

  if (!shouldShowConsole) {
    return null;
  }

  return (
    <div className={`bg-black border border-green-500/30 rounded-none overflow-hidden shadow-2xl shadow-green-500/10 ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-400" />
            <span className="text-sm font-mono text-green-300">
              Training Console
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 text-gray-400 hover:text-green-300 hover:bg-gray-700"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && !isMinimized && (
        <div className="h-96">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-4 font-mono text-sm bg-black min-h-full">
              {terminalLines.length === 0 && (
                <div className="text-green-400 animate-pulse">
                  <span className="text-gray-500">{formatTime(new Date())}</span> Waiting for training to start...
                </div>
              )}
              
              {terminalLines.map((line) => (
                <div key={line.id} className="flex items-start gap-2 mb-1 leading-relaxed">
                  <span className="text-gray-500 text-xs flex-shrink-0 min-w-[70px]">
                    {formatTime(line.timestamp)}
                  </span>
                  {line.prefix && (
                    <span className="text-green-500 flex-shrink-0 min-w-[60px]">
                      {line.prefix}
                    </span>
                  )}
                  <span className={`${getLineColor(line.type)} flex-1 whitespace-pre-wrap`}>
                    {line.content}
                  </span>
                </div>
              ))}
              
              {/* Blinking cursor when active */}
              {currentPhase && currentPhase !== 'completed' && currentPhase !== 'failed' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-500 text-xs flex-shrink-0 min-w-[70px]">
                    {formatTime(new Date())}
                  </span>
                  <span className="text-green-500 flex-shrink-0 min-w-[60px]">
                    [SYS]
                  </span>
                  <span className="text-green-400 animate-pulse">█</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Minimized state */}
      {isMinimized && (
        <div className="px-4 py-2 bg-black">
          <div className="flex items-center gap-2 font-mono text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400">
              {getCurrentProgressText()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
