
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
  type: 'command' | 'output' | 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  prefix?: string;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ className = '', isTraining = false, refetchAgentData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastEventRef = useRef<string | null>(null);
  
  const { state } = useBuilder();
  const agentId = state.agentData.id?.toString();
  const currentTask = agentId ? AgentTrainingService.getTrainingTask(agentId) : null;

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

          // Filter duplicate events
          const eventKey = `${eventType}-${eventData.status}-${JSON.stringify(eventData.train_data)}`;
          if (eventKey === lastEventRef.current) return;
          lastEventRef.current = eventKey;

          if (eventType === 'training_connected') {
            // Clear terminal and start fresh
            setTerminalLines([]);
            addTerminalLine('Agent Training System v2.0.1', 'info', '🤖');
            addTerminalLine('Initializing training environment...', 'info', '⚡');
            addTerminalLine(`Connected to agent ${agentId}`, 'success', '✓');
            addTerminalLine('', 'output');
            setCurrentProgress(0);
            setTotalSources(0);
            setCurrentPhase('connecting');
            setIsCompleted(false);
          } else if (eventType === 'training_progress' && eventData.train_data) {
            const trainData = eventData.train_data;
            const { phase, message, processed_count = 0, total_count = 0, current_source } = trainData;
            
            setCurrentProgress(processed_count);
            setTotalSources(total_count);
            setCurrentPhase(phase);

            if (phase === 'extracting') {
              if (message?.includes('Starting text extraction')) {
                addTerminalLine(`$ train-agent --sources=${total_count} --mode=extract`, 'command', '$');
                addTerminalLine(`Preparing to extract text from ${total_count} knowledge sources...`, 'output');
                addTerminalLine('', 'output');
              } else if (current_source) {
                const sourceType = current_source.type === 'website' ? '🌐' : '📄';
                const sourceName = current_source.type === 'website' 
                  ? new URL(current_source.source).hostname 
                  : current_source.title;
                
                addTerminalLine(`[${processed_count + 1}/${total_count}] Extracting ${sourceType} ${sourceName}...`, 'info', '⚙️');
                
                // Show progress bar for extraction
                const progressBar = '█'.repeat(Math.floor((processed_count / total_count) * 20)) + 
                                  '░'.repeat(20 - Math.floor((processed_count / total_count) * 20));
                addTerminalLine(`[${progressBar}] ${Math.round((processed_count / total_count) * 100)}%`, 'output');
              }
            } else if (phase === 'extraction_completed') {
              addTerminalLine('✓ Text extraction completed successfully', 'success', '✓');
              addTerminalLine(`Extracted content from ${processed_count} sources`, 'success');
              addTerminalLine('', 'output');
            } else if (phase === 'embedding_start') {
              const chunkMatch = message?.match(/(\d+)\s+chunks/);
              const totalChunks = chunkMatch ? parseInt(chunkMatch[1]) : 0;
              
              addTerminalLine('$ generate-embeddings --engine=openai --chunks=' + totalChunks, 'command', '$');
              addTerminalLine('Initializing OpenAI embedding engine...', 'output');
              addTerminalLine(`Processing ${totalChunks} text chunks with AI embeddings`, 'info');
              addTerminalLine('', 'output');
            }
          } else if (eventType === 'training_completed' && eventData.train_data) {
            const trainData = eventData.train_data;
            if (trainData.phase === 'embedding_completed') {
              addTerminalLine('✓ AI embedding generation completed', 'success', '✓');
              addTerminalLine('✓ Knowledge base updated successfully', 'success', '✓');
              addTerminalLine('✓ Agent training completed', 'success', '✓');
              addTerminalLine('', 'output');
              addTerminalLine('Training process finished. Agent is ready for deployment.', 'success');
              addTerminalLine('$ exit', 'command', '$');
              setCurrentPhase('completed');
              setIsCompleted(true);
            }
          } else if (eventType === 'training_failed') {
            addTerminalLine('✗ Training failed', 'error', '✗');
            addTerminalLine(eventData.error || 'Unknown error occurred', 'error');
            addTerminalLine('$ exit 1', 'command', '$');
            setCurrentPhase('failed');
          }
        }
      }
    };

    updateEventLogs();
    const interval = setInterval(updateEventLogs, 500);
    return () => clearInterval(interval);
  }, [agentId]);

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
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {/* Terminal Control Buttons */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-300">
              training@7en:~$ agent-{agentId}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-700"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-700"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && !isMinimized && (
        <div className="h-96">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-4 font-mono text-sm bg-gray-900 min-h-full">
              {terminalLines.length === 0 && (
                <div className="text-gray-500">
                  <span className="text-gray-600">{formatTime(new Date())}</span> Waiting for training to start...
                </div>
              )}
              
              {terminalLines.map((line) => (
                <div key={line.id} className="flex items-start gap-2 mb-1 leading-relaxed">
                  {line.prefix && (
                    <span className="text-gray-500 flex-shrink-0">
                      {line.prefix}
                    </span>
                  )}
                  <span className="text-gray-600 text-xs flex-shrink-0 w-20">
                    {formatTime(line.timestamp)}
                  </span>
                  <span className={`${getLineColor(line.type)} flex-1 whitespace-pre-wrap`}>
                    {line.content}
                  </span>
                </div>
              ))}
              
              {/* Blinking cursor when active */}
              {currentPhase && currentPhase !== 'completed' && currentPhase !== 'failed' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600 text-xs w-20">
                    {formatTime(new Date())}
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
        <div className="px-4 py-2 bg-gray-900">
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
