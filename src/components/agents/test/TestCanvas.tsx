
import React, { useState } from 'react';
import { ChatInput } from '@/components/agents/modelComparison/ChatInput';
import { ModelComparisonGrid } from './ModelComparisonGrid';
import { HistoryPanel } from './HistoryPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import { 
  Plus, 
  Minus, 
  History,
  Settings,
  Send
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HistoryItem } from '@/types/history';

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

interface TestCanvasProps {
  numModels: number;
  chatConfigs: any[];
  messages: any[][];
  primaryColors: string[];
  modelConnections: boolean[];
  isProcessing: boolean;
  cellLoadingStates: boolean[];
  agent?: any;
  selectedModelIndex: number;
  showRightPanel: boolean;
  history: HistoryItem[];
  isHistoryMode: boolean;
  selectedHistoryId: string | null;
  isPreparingNewMessage: boolean;
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
  onSendMessage: (message: string) => void;
  onAddModel: () => void;
  onRemoveModel: () => void;
  onSelectModel: (index: number) => void;
  onSelectCellConfig: (cellId: string) => void;
  onToggleRightPanel: (show: boolean) => void;
  onSelectHistory: (item: HistoryItem) => void;
  onPrepareNewMessage: () => void;
  onLoadHistoryData: (item: HistoryItem) => void;
}

export const TestCanvas = ({
  numModels,
  chatConfigs,
  messages,
  primaryColors,
  modelConnections,
  isProcessing,
  cellLoadingStates,
  agent,
  selectedModelIndex,
  showRightPanel,
  history,
  isHistoryMode,
  selectedHistoryId,
  isPreparingNewMessage,
  onUpdateChatConfig,
  onSendMessage,
  onAddModel,
  onRemoveModel,
  onSelectModel,
  onSelectCellConfig,
  onToggleRightPanel,
  onSelectHistory,
  onPrepareNewMessage,
  onLoadHistoryData
}: TestCanvasProps) => {
  const [expandedCellId, setExpandedCellId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const modelCells: ModelCell[] = Array(numModels).fill(null).map((_, index) => ({
    id: `cell-${index}`,
    model: chatConfigs[index]?.model || '',
    config: {
      temperature: chatConfigs[index]?.temperature || 0.7,
      maxLength: chatConfigs[index]?.maxLength || 150,
      systemPrompt: chatConfigs[index]?.systemPrompt || ''
    },
    messages: messages[index] || [],
    isLoading: cellLoadingStates[index] || false
  }));

  const handleBatchTest = () => {
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

  const handleSelectHistory = (item: HistoryItem) => {
    console.log('Loading history item:', item);
    onSelectHistory(item);
    onLoadHistoryData(item);
    onSelectModel(0);
    onToggleRightPanel(true);
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      onToggleRightPanel(true);
    }
  };

  const handleSendMessage = (message: string) => {
    onSendMessage(message);
  };

  const getInputPlaceholder = () => {
    if (isHistoryMode) {
      return "You can configure parameters and send a new query...";
    }
    if (isPreparingNewMessage) {
      return "Configure parameters above, then send your message...";
    }
    return "Type your query to compare responses across all models...";
  };

  const isInputDisabled = () => {
    return isProcessing || modelConnections.some(status => !status);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dottedBackgroundStyle }} />
      
      <div className="h-full flex flex-col dotted-background relative">
        {/* Canvas Header */}
        <div className="h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Model Comparison
              </h2>
              {isHistoryMode && (
                <Badge variant="secondary" className="text-xs">
                  History Mode
                </Badge>
              )}
              {isPreparingNewMessage && (
                <Badge variant="outline" className="text-xs">
                  Configuring New Message
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

            {/* Model Comparison Grid */}
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
          <div className="border-t bg-background/95 backdrop-blur-sm px-4 py-4 flex-shrink-0">
            {/* Send New Message Button in History Mode */}
            {isHistoryMode && !isPreparingNewMessage && (
              <div className="mb-3 flex justify-center">
                <ModernButton
                  onClick={onPrepareNewMessage}
                  variant="gradient"
                  size="sm"
                  icon={Send}
                  className="shadow-lg"
                >
                  Send New Message
                </ModernButton>
              </div>
            )}
            
            <ChatInput 
              onSendMessage={handleSendMessage}
              primaryColor={primaryColors[0] || '#9b87f5'}
              isDisabled={isInputDisabled()}
              placeholder={getInputPlaceholder()}
              value={undefined}
              readonly={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
