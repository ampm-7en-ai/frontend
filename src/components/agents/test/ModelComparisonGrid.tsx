
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAIModels } from '@/hooks/useAIModels';
import { 
  Settings, 
  Maximize2, 
  Minimize2,
  Loader2
} from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';

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

interface ModelComparisonGridProps {
  cells: ModelCell[];
  onCellClick: (cellId: string) => void;
  onModelChange: (cellId: string, model: string) => void;
  onConfigClick: (cellId: string) => void;
  selectedCellId: string | null;
  expandedCellId: string | null;
  onToggleExpand: (cellId: string) => void;
}

export const ModelComparisonGrid = ({
  cells,
  onCellClick,
  onModelChange,
  onConfigClick,
  selectedCellId,
  expandedCellId,
  onToggleExpand
}: ModelComparisonGridProps) => {
  const { modelOptionsForDropdown } = useAIModels();

  const getGridClass = () => {
    const numCells = cells.length;
    
    if (expandedCellId) {
      return 'grid-cols-1 grid-rows-1';
    }
    
    // Auto-adjust grid based on number of cells
    if (numCells === 1) {
      return 'grid-cols-1 grid-rows-1'; // 1 cell full width and height
    } else if (numCells === 2) {
      return 'grid-cols-2 grid-rows-1'; // 2 cells side by side, full height
    } else if (numCells === 3) {
      return 'grid-cols-3 grid-rows-1'; // 3 cells in one row, full height
    } else if (numCells === 4) {
      return 'grid-cols-2 grid-rows-2'; // 2x2 grid, each cell takes 1/2 height
    } else if (numCells <= 6) {
      return 'grid-cols-3 grid-rows-2'; // 3x2 grid, each cell takes 1/2 height
    } else {
      return 'grid-cols-3 grid-rows-3'; // 3x3 grid, each cell takes 1/3 height
    }
  };

  const getModelDisplay = (modelValue: string) => {
    const option = modelOptionsForDropdown.find(opt => opt.value === modelValue);
    return option ? option.label : modelValue;
  };

  const renderCell = (cell: ModelCell) => {
    const isSelected = selectedCellId === cell.id;
    const isExpanded = expandedCellId === cell.id;

    return (
      <Card 
        key={cell.id} 
        className={`
          transition-all duration-200 cursor-pointer h-full rounded-none border-border dark:border-gray-700
          ${isSelected 
            ? 'bg-muted/50 dark:bg-slate-900/30' 
            : 'bg-card dark:bg-muted/10 hover:bg-muted/30 dark:hover:bg-slate-900/30'
          }
          ${isExpanded ? 'col-span-full row-span-full' : ''}
          ${expandedCellId && expandedCellId !== cell.id ? 'hidden' : ''}
        `}
        onClick={() => onCellClick(cell.id)}
      >
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <ModernDropdown
                value={cell.model}
                onValueChange={(value) => onModelChange(cell.id, value)}
                options={modelOptionsForDropdown}
                placeholder="Select Model"
                className="h-8 text-xs bg-muted/50 border-0 flex-1"
                showSearch={false}
                trigger={
                  <ModernButton
                    variant="secondary"
                    className="h-8 text-xs bg-muted/50 dark:bg-slate-500 border-0 flex-1 justify-start px-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="truncate">{getModelDisplay(cell.model)}</span>
                    </div>
                  </ModernButton>
                }
              />
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 dark:hover:bg-gray-500"
                    iconOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigClick(cell.id);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </ModernButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure parameters</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 dark:hover:bg-gray-500"
                    iconOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(cell.id);
                    }}
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </ModernButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExpanded ? 'Minimize' : 'Expand'} view</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {cell.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating response...</span>
                  </div>
                </div>
              ) : cell.messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Ready to respond</p>
                  <p className="text-xs text-muted-foreground/60">
                    Send a query to see model response
                  </p>
                </div>
              ) : (
                // Show only the latest AI response
                (() => {
                  const latestAiMessage = cell.messages
                    .filter(msg => msg.sender?.startsWith('agent') || msg.type === 'assistant' || msg.sender === 'assistant')
                    .pop();
                  
                  return latestAiMessage ? (
                    <div className="space-y-2">
                      <p className="text-sm dark:text-gray-500">AI Assistant</p>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {latestAiMessage.content}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No response yet</p>
                    </div>
                  );
                })()
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  if (cells.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No model cells available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid h-full w-full ${getGridClass()}`}>
      {cells.map(renderCell)}
    </div>
  );
};
