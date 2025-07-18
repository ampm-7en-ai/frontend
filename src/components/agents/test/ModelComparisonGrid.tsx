import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Settings, 
  Maximize2, 
  Minimize2,
  Loader2
} from 'lucide-react';
// Mock model options - replace with real data
const modelOptions = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'mistral-large-latest', label: 'Mistral Large' },
];

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
  const getGridClass = () => {
    const numCells = cells.length;
    
    if (expandedCellId) {
      return 'grid-cols-1 grid-rows-1';
    }
    
    // Auto-adjust grid based on number of cells
    if (numCells <= 2) {
      return 'grid-cols-2 grid-rows-1'; // 2 cells side by side, full height
    } else if (numCells <= 4) {
      return 'grid-cols-2 grid-rows-2'; // 2x2 grid, each cell takes 1/2 height
    } else if (numCells <= 6) {
      return 'grid-cols-3 grid-rows-2'; // 3x2 grid, each cell takes 1/2 height
    } else {
      return 'grid-cols-3 grid-rows-3'; // 3x3 grid, each cell takes 1/3 height
    }
  };

  const getModelDisplay = (modelValue: string) => {
    const option = modelOptions.find(opt => opt.value === modelValue);
    return option ? option.label : modelValue;
  };

  const renderCell = (cell: ModelCell) => {
    const isSelected = selectedCellId === cell.id;
    const isExpanded = expandedCellId === cell.id;

    return (
      <Card 
        key={cell.id} 
        className={`
          transition-all duration-200 cursor-pointer h-full
          ${isSelected 
            ? 'ring-2 ring-primary ring-offset-2 shadow-lg' 
            : 'hover:shadow-md border-border'
          }
          ${isExpanded ? 'col-span-full row-span-full' : ''}
          ${expandedCellId && expandedCellId !== cell.id ? 'hidden' : ''}
        `}
        onClick={() => onCellClick(cell.id)}
      >
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Select
                value={cell.model}
                onValueChange={(value) => onModelChange(cell.id, value)}
              >
                <SelectTrigger
                  className="h-8 text-xs bg-muted/50 border-0 flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="truncate">{getModelDisplay(cell.model)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigClick(cell.id);
                    }}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure parameters</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(cell.id);
                    }}
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-3 w-3" />
                    ) : (
                      <Maximize2 className="h-3 w-3" />
                    )}
                  </Button>
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
                // Show only the latest assistant response
                cell.messages.slice(-1).map((message) => {
                  if (message.sender === 'assistant' || message.type === 'assistant') {
                    return (
                      <div key={message.id || message.timestamp} className="space-y-2">
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }).filter(Boolean)
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`grid h-full w-full ${getGridClass()}`}>
      {cells.map(renderCell)}
    </div>
  );
};