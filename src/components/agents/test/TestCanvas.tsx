
import React, { useState } from 'react';
import { ModelComparisonCard } from '@/components/agents/modelComparison/ModelComparisonCard';
import { ChatInput } from '@/components/agents/modelComparison/ChatInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Zap,
  Brain,
  Maximize2
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

interface TestCanvasProps {
  numModels: number;
  chatConfigs: any[];
  messages: any[][];
  primaryColors: string[];
  modelConnections: boolean[];
  isProcessing: boolean;
  agent?: any;
  selectedModelIndex: number;
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
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
  isProcessing,
  agent,
  selectedModelIndex,
  onUpdateChatConfig,
  onSendMessage,
  onAddModel,
  onRemoveModel,
  onSelectModel
}: TestCanvasProps) => {
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
    <>
      {/* Add the dotted background pattern styling */}
      <style dangerouslySetInnerHTML={{ __html: dottedBackgroundStyle }} />
      
      <div className="h-full flex flex-col dotted-background">
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
                {numModels} {numModels === 1 ? 'Model' : 'Models'}
              </Badge>
              <Badge 
                variant={modelConnections.every(Boolean) ? "default" : "destructive"} 
                className="text-xs"
              >
                {modelConnections.filter(Boolean).length}/{numModels} Connected
              </Badge>
              {selectedModelIndex !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  Active: Model {selectedModelIndex + 1}
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

            <div className="h-4 w-px bg-border" />

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

        {/* Model Cards Container - Constrained Width Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto p-4 overflow-auto">
            <div className={`grid gap-4 h-fit ${getGridCols()}`}>
              {Array(numModels).fill(null).map((_, index) => {
                const primaryColor = primaryColors[index] || '#9b87f5';
                const isExpanded = expandedCard === index;
                const isSelected = selectedModelIndex === index;
                
                return (
                  <div 
                    key={`model-${index}`} 
                    className={`transition-all duration-300 cursor-pointer ${isExpanded ? 'col-span-full' : ''}`}
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
                      onOpenSystemPrompt={() => {}}
                      onUpdateConfig={(field, value) => onUpdateChatConfig(index, field, value)}
                      primaryColor={primaryColor}
                      avatarSrc={agent?.avatarSrc}
                      isConnected={modelConnections[index]}
                      className={`${isExpanded ? 'h-[720px]' : 'h-[780px]'} ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                      } bg-card/90 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:ring-2 hover:ring-primary/30 hover:ring-offset-1`}
                      showExpandButton={true}
                      onExpand={() => toggleCardExpansion(index)}
                      isExpanded={isExpanded}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="h-16 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="max-w-7xl mx-auto">
            <ChatInput 
              onSendMessage={onSendMessage}
              primaryColor={primaryColors[0] || '#9b87f5'}
              isDisabled={isProcessing || modelConnections.some(status => !status)}
              placeholder="Type your message to test all models..."
            />
          </div>
        </div>
      </div>
    </>
  );
};
