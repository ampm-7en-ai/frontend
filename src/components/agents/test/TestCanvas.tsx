import React, { useState } from 'react';
import { ModelComparisonCard } from '@/components/agents/modelComparison/ModelComparisonCard';
import { ChatInput } from '@/components/agents/modelComparison/ChatInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  Maximize2, 
  Plus, 
  Minus, 
  LayoutGrid,
  List,
  Zap,
  Brain
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TestCanvasProps {
  numModels: number;
  chatConfigs: any[];
  messages: any[][];
  primaryColors: string[];
  modelConnections: boolean[];
  isSaving: number | null;
  isProcessing: boolean;
  agent?: any;
  selectedModelIndex: number;
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
  onSystemPromptEdit: (index: number) => void;
  onSaveConfig: (index: number) => void;
  onSendMessage: (message: string) => void;
  onAddModel: () => void;
  onRemoveModel: () => void;
  onSelectModel: (index: number) => void;
}

export const TestCanvas = ({
  numModels,
  chatConfigs,
  messages,
  primaryColors,
  modelConnections,
  isSaving,
  isProcessing,
  agent,
  selectedModelIndex,
  onUpdateChatConfig,
  onSystemPromptEdit,
  onSaveConfig,
  onSendMessage,
  onAddModel,
  onRemoveModel,
  onSelectModel
}: TestCanvasProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);


  const handleBatchTest = () => {
    // TODO: Implement batch test functionality
    console.log('Batch test clicked');
  };

  const toggleCardExpansion = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const getGridCols = () => {
    if (expandedCard !== null) return 'grid-cols-1';
    if (numModels === 1) return 'grid-cols-1';
    if (numModels === 2) return 'grid-cols-1 lg:grid-cols-2';
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
      {/* Canvas Header */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Model Comparison
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {numModels} {numModels === 1 ? 'Model' : 'Models'}
              </Badge>
              <Badge 
                variant={modelConnections.every(Boolean) ? "default" : "destructive"} 
                className="text-xs"
              >
                {modelConnections.filter(Boolean).length}/{numModels} Connected
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBatchTest}
                  className="h-8"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send test to all models</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Button
                variant={viewMode === 'grid' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-2"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddModel}
                  className="h-8"
                  disabled={numModels >= 4}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add model comparison</p>
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
                <p>Remove model comparison</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Model Cards Container */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`grid gap-4 h-fit ${viewMode === 'grid' ? getGridCols() : 'grid-cols-1'}`}>
          {Array(numModels).fill(null).map((_, index) => {
            const primaryColor = primaryColors[index] || '#9b87f5';
            const isExpanded = expandedCard === index;
            const isSelected = selectedModelIndex === index;
            
            return (
              <div 
                key={`model-${index}`} 
                className={`transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}
                onClick={() => onSelectModel(index)}
              >
                <ModelComparisonCard
                  index={index}
                  model={chatConfigs[index]?.model || ''}
                  temperature={chatConfigs[index]?.temperature || 0.7}
                  maxLength={chatConfigs[index]?.maxLength || 150}
                  systemPrompt={chatConfigs[index]?.systemPrompt || ''}
                  messages={messages[index] || []}
                  onModelChange={(value) => onUpdateChatConfig(index, 'model', value)}
                  onOpenSystemPrompt={() => onSystemPromptEdit(index)}
                  onUpdateConfig={(field, value) => onUpdateChatConfig(index, field, value)}
                  onSaveConfig={() => onSaveConfig(index)}
                  primaryColor={primaryColor}
                  avatarSrc={agent?.avatarSrc}
                  isConnected={modelConnections[index]}
                  isSaving={isSaving === index}
                  className={`${isExpanded ? 'h-[600px]' : 'h-[400px]'} ${
                    isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                  } cursor-pointer`}
                  showExpandButton={true}
                  onExpand={() => toggleCardExpansion(index)}
                  isExpanded={isExpanded}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/50">
        <ChatInput 
          onSendMessage={onSendMessage}
          primaryColor={primaryColors[0] || '#9b87f5'}
          isDisabled={isProcessing || modelConnections.some(status => !status)}
          placeholder="Type your message to test all models..."
        />
      </div>
    </div>
  );
};