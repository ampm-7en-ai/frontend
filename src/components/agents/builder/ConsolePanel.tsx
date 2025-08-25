import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Terminal, Minimize2, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { trainingSSEService, SSEEventLog } from '@/services/TrainingSSEService';
import { useBuilder } from '@/components/agents/builder/BuilderContext';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface SourceProgress {
  id: number;
  title: string;
  type: string;
  status: 'pending' | 'active' | 'completed';
  processed: boolean;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false, refetchAgentData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [sources, setSources] = useState<SourceProgress[]>([]);
  const [processedSources, setProcessedSources] = useState<Set<number>>(new Set());
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastEventRef = useRef<string | null>(null);
  
  const { state } = useBuilder();
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

  // Get actual knowledge sources count from BuilderContext (excluding deleted ones)
  const actualKnowledgeSourcesCount = state.agentData.knowledgeSources?.filter(
    source => source.status !== 'Deleted' && source.trainingStatus !== 'Deleted'
  ).length || 0;

  // Only show console panel if CURRENT agent is training
  const shouldShowConsole = state.agentData.status === 'Training' || currentTask?.status === 'training' || isTraining;

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

  // Enhanced event processing
  useEffect(() => {
    const updateEventLogs = () => {
      if (agentId) {
        const logs = trainingSSEService.getRecentEventLogs(agentId, 10);
        
        // Process the latest event
        const latestEvent = logs[0];
        if (latestEvent) {
          const eventData = latestEvent.event.data;
          const eventType = latestEvent.event.event;

          // Create a more specific event key to avoid duplicates
          const eventKey = `${eventType}-${eventData.status}-${eventData.train_data?.phase}-${eventData.train_data?.processed_count}-${eventData.train_data?.current_source?.id}`;
          if (eventKey === lastEventRef.current) return;
          lastEventRef.current = eventKey;

          if (eventType === 'training_connected') {
            // Clear terminal and start fresh
            setTerminalLines([]);
            setSources([]);
            setProcessedSources(new Set());
            
            // Use actual knowledge sources count from BuilderContext
            const actualTotal = actualKnowledgeSourcesCount;
            setTotalSources(actualTotal);
            
            addTerminalLine('╔═══════════════════════════════════════════════════════════════════════╗', 'system');
            addTerminalLine('║                     7EN AI Training Terminal v2.1                    ║', 'system');
            addTerminalLine('╚═══════════════════════════════════════════════════════════════════════╝', 'system');
            addTerminalLine('', 'output');
            addTerminalLine('🚀 Initializing agent training environment...', 'info', '[INIT]');
            addTerminalLine(`✓ Connected to agent-${agentId}`, 'success', '[CONN]');
            addTerminalLine('', 'output');
            setCurrentProgress(0);
            setCurrentPhase('connecting');
            setIsCompleted(false);
          } else if (eventType === 'training_progress' && eventData.train_data) {
            const trainData = eventData.train_data;
            const { phase, message, processed_count = 0, total_count = 0, current_source } = trainData;
            
            // Use actual knowledge sources count instead of API total_count
            const actualTotal = actualKnowledgeSourcesCount;
            setTotalSources(actualTotal);
            setCurrentProgress(processed_count);
            setCurrentPhase(phase);

            if (phase === 'extracting') {
              if (message?.includes('Starting text extraction')) {
                addTerminalLine('$ sudo apt-get update && apt-get install knowledge-extractor', 'command');
                addTerminalLine('Reading package lists... Done', 'output');
                addTerminalLine('Building dependency tree... Done', 'output');
                addTerminalLine(`Found ${actualTotal} knowledge source(s) to process`, 'info');
                addTerminalLine('', 'output');
                addTerminalLine('The following packages will be INSTALLED:', 'output');
                addTerminalLine(`  knowledge-sources (${actualTotal} sources)`, 'output');
                addTerminalLine('', 'output');
              } else if (current_source && !processedSources.has(current_source.id)) {
                const sourceType = current_source.type === 'website' ? '🌐' : '📄';
                const sourceName = current_source.type === 'website' 
                  ? new URL(current_source.source).hostname 
                  : current_source.title;
                
                // Update sources state
                setSources(prev => {
                  const existing = prev.find(s => s.id === current_source.id);
                  if (!existing) {
                    return [...prev, {
                      id: current_source.id,
                      title: sourceName,
                      type: sourceType,
                      status: 'active',
                      processed: false
                    }];
                  }
                  return prev.map(s => 
                    s.id === current_source.id 
                      ? { ...s, status: 'active' as const }
                      : { ...s, status: s.processed ? 'completed' as const : 'pending' as const }
                  );
                });

                // Calculate current source index based on completed sources + 1
                const completedSourcesCount = sources.filter(s => s.status === 'completed').length;
                const currentIndex = completedSourcesCount + 1;
                
                addTerminalLine(`[${currentIndex}/${actualTotal}] Extracting ${sourceType} ${sourceName}...`, 'info');
                
                // Show progress bar based on current source progress within the total
                const sourceProgressPercentage = Math.round((currentIndex / actualTotal) * 100);
                const filledBars = Math.floor(sourceProgressPercentage / 5);
                const emptyBars = 20 - filledBars;
                const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
                addTerminalLine(`[${progressBar}] ${sourceProgressPercentage}% complete`, 'output');
                
                // Mark as processed
                setProcessedSources(prev => new Set([...prev, current_source.id]));
              }
            } else if (phase === 'extraction_completed') {
              // Mark current source as completed
              setSources(prev => prev.map(s => ({ ...s, status: 'completed' as const, processed: true })));
              
              addTerminalLine('', 'output');
              addTerminalLine('✓ Text extraction completed successfully', 'success');
              addTerminalLine(`✓ Processed ${actualTotal} knowledge sources`, 'success');
              addTerminalLine('', 'output');
            } else if (phase === 'embedding_start') {
              const chunkMatch = message?.match(/(\d+)\s+chunks/);
              const totalChunks = chunkMatch ? parseInt(chunkMatch[1]) : 0;
              
              addTerminalLine('$ npm install --upgrade ai-embeddings-engine', 'command');
              addTerminalLine('Collecting ai-embeddings-engine', 'output');
              addTerminalLine('  Using cached ai_embeddings_engine-3.0.0.tgz', 'output');
              addTerminalLine(`Processing ${totalChunks} text chunks with AI embeddings`, 'info');
              addTerminalLine('', 'output');
              
              // Show embedding progress
              for (let i = 0; i < Math.min(totalChunks, 10); i++) {
                setTimeout(() => {
                  const chunkProgress = Math.round(((i + 1) / totalChunks) * 100);
                  const dots = '.'.repeat((i % 3) + 1);
                  addTerminalLine(`Generating embeddings${dots} [${i + 1}/${totalChunks}] ${chunkProgress}%`, 'info');
                }, i * 200);
              }
            }
          } else if (eventType === 'training_completed' && eventData.train_data) {
            const trainData = eventData.train_data;
            if (trainData.phase === 'embedding_completed') {
              addTerminalLine('', 'output');
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
        }
      }
    };

    updateEventLogs();
    const interval = setInterval(updateEventLogs, 500);
    return () => clearInterval(interval);
  }, [agentId, refetchAgentData, sources, actualKnowledgeSourcesCount]);

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

  if (!shouldShowConsole) {
    return null;
  }

  return (
    <div className={`bg-black border border-green-500/30 rounded-lg overflow-hidden shadow-2xl shadow-green-500/10 ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          {/* Terminal Control Buttons */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-400" />
            <span className="text-sm font-mono text-green-300">
              root@7en-training:~$ agent-{agentId}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 text-gray-400 hover:text-green-300 hover:bg-gray-700"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
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
              {currentPhase === 'extracting' 
                ? `Extracting sources... [${currentProgress}/${totalSources}]`
                : currentPhase === 'embedding' 
                ? 'Generating AI embeddings...'
                : currentPhase === 'completed'
                ? 'Training completed ✓'
                : 'Training in progress...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
