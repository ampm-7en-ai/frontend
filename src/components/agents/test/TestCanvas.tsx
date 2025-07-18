
import React, { useState } from 'react';
import { ChatInput } from '@/components/agents/modelComparison/ChatInput';
import { ModelComparisonGrid } from './ModelComparisonGrid';
import { HistoryPanel } from './HistoryPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Zap,
  Brain,
  History
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Dotted background pattern for the model comparison area
const dottedBackgroundStyle = `
  .dotted-background {
    background-color: #f8f9fa;
    background-image: radial-gradient(#d1d5db 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .dark .dotted-background {
    background-color: #1f2937;
    background-image: radial-gradient(#374151 1px, transparent 1px);
  }
`;

interface ModelCell {
  id: string;
  model: string;
  config: {
    temperature: number;
    maxLength: number;
    systemPrompt: string;
  };
  messages: any[];
  isLoading: boolean;
}

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  responses: any[];
  configs: any[];
}

interface TestCanvasProps {
  numModels: number;
  chatConfigs: any[];
  messages: any[][];
  primaryColors: string[];
  modelConnections: boolean[];
  isProcessing: boolean;
  agent?: any;
  selectedModelIndex: number;
  showRightPanel: boolean;
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
  onSendMessage: (message: string) => void;
  onAddModel: () => void;
  onRemoveModel: () => void;
  onSelectModel: (index: number) => void;
  onSelectCellConfig: (cellId: string) => void;
  onToggleRightPanel: (show: boolean) => void;
}

export const TestCanvas = ({
  numModels,
  chatConfigs,
  messages,
  primaryColors,
  modelConnections,
  isProcessing,
  agent,
  selectedModelIndex,
  showRightPanel,
  onUpdateChatConfig,
  onSendMessage,
  onAddModel,
  onRemoveModel,
  onSelectModel,
  onSelectCellConfig,
  onToggleRightPanel
}: TestCanvasProps) => {
  const [expandedCellId, setExpandedCellId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // Create model cells from current configuration
  const modelCells: ModelCell[] = Array(numModels).fill(null).map((_, index) => ({
    id: `cell-${index}`,
    model: chatConfigs[index]?.model || '',
    config: {
      temperature: chatConfigs[index]?.temperature || 0.7,
      maxLength: chatConfigs[index]?.maxLength || 150,
      systemPrompt: chatConfigs[index]?.systemPrompt || ''
    },
    messages: messages[index] || [],
    isLoading: isProcessing
  }));

  const handleBatchTest = () => {
    // TODO: Implement batch test functionality
    console.log('Batch test clicked');
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCellId(cellId);
    const cellIndex = parseInt(cellId.split('-')[1]);
    onSelectModel(cellIndex);
    onSelectCellConfig(cellId);
    onToggleRightPanel(true);
  };

  const handleModelChange = (cellId: string, model: string) => {
    const cellIndex = parseInt(cellId.split('-')[1]);
    onUpdateChatConfig(cellIndex, 'model', model);
  };

  const handleConfigClick = (cellId: string) => {
    setSelectedCellId(cellId);
    const cellIndex = parseInt(cellId.split('-')[1]);
    onSelectModel(cellIndex);
    onSelectCellConfig(cellId);
    onToggleRightPanel(true);
  };

  const handleToggleExpand = (cellId: string) => {
    setExpandedCellId(expandedCellId === cellId ? null : cellId);
  };

  const handleSendMessage = (message: string) => {
    if (!isHistoryMode) {
      // Save current state to history before sending new message
      const newHistoryItem: HistoryItem = {
        id: `history-${Date.now()}`,
        query: message,
        timestamp: new Date(),
        responses: [...messages],
        configs: [...chatConfigs]
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setCurrentQuery(message);
    } else {
      // Exit history mode and send new message
      setIsHistoryMode(false);
      setSelectedHistoryId(null);
      setCurrentQuery(message);
    }
    onSendMessage(message);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedHistoryId(item.id);
    setCurrentQuery(item.query);
    setIsHistoryMode(true);
    // Load historical responses and configs
    onSelectModel(0); // Select first model for config display
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      onToggleRightPanel(true);
    }
  };

  return (
    <>
      {/* Add the dotted background pattern styling */}
      <style dangerouslySetInnerHTML={{ __html: dottedBackgroundStyle }} />
      
      <div className="h-full flex flex-col dotted-background relative">
        {/* Canvas Header */}
        <div className="h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Model Comparison
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {numModels} {numModels === 1 ? 'Cell' : 'Cells'}
              </Badge>
              <Badge 
                variant={modelConnections.every(Boolean) ? "default" : "destructive"} 
                className="text-xs"
              >
                {modelConnections.filter(Boolean).length}/{numModels} Connected
              </Badge>
              {selectedCellId && (
                <Badge variant="secondary" className="text-xs">
                  Active: {selectedCellId}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleHistory}
                  className={`h-8 ${showHistory ? 'bg-muted' : ''}`}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle query history</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddModel}
                  className="h-8"
                  disabled={numModels >= 6}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add model cell</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveModel}
                  className="h-8"
                  disabled={numModels <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove model cell</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBatchTest}
                  className="h-8"
                  disabled={!modelConnections.every(Boolean)}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send test to all models</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 min-h-0">
            {/* History Panel */}
            {showHistory && (
              <HistoryPanel
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                history={history}
                onSelectHistory={handleSelectHistory}
                selectedHistoryId={selectedHistoryId}
              />
            )}

            {/* Top Canvas - Model Comparison Grid */}
            <div className="flex-1 min-h-0">
              <ModelComparisonGrid
                cells={modelCells}
                onCellClick={handleCellClick}
                onModelChange={handleModelChange}
                onConfigClick={handleConfigClick}
                selectedCellId={selectedCellId}
                expandedCellId={expandedCellId}
                onToggleExpand={handleToggleExpand}
              />
            </div>
          </div>

          {/* Bottom Canvas - Chat Input */}
          <div className="h-24 border-t bg-background/95 backdrop-blur-sm px-4 py-4 flex-shrink-0">
            <ChatInput 
              onSendMessage={handleSendMessage}
              primaryColor={primaryColors[0] || '#9b87f5'}
              isDisabled={isProcessing || modelConnections.some(status => !status)}
              placeholder={isHistoryMode ? "Enter new query to exit history mode..." : "Type your query to compare responses across all models..."}
              value={isHistoryMode ? currentQuery : undefined}
              readonly={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
