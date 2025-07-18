import React, { useState } from 'react';
import { Settings, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMessage } from '@/components/agents/modelComparison/UserMessage';
import { ModelMessage } from '@/components/agents/modelComparison/ModelMessage';
import { getModelDisplay, MODELS } from '@/constants/modelOptions';

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
  selectedCellId?: string;
  expandedCellId?: string;
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
  const modelOptions = Object.entries(MODELS).map(([value, model]) => ({
    value,
    label: model.name,
    provider: model.provider
  }));

  const getGridClass = () => {
    if (expandedCellId) return 'grid-cols-1';
    
    const cellCount = cells.length;
    if (cellCount === 1) return 'grid-cols-1';
    if (cellCount === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (cellCount <= 4) return 'grid-cols-1 lg:grid-cols-2';
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
  };

  const renderCell = (cell: ModelCell) => {
    const isSelected = selectedCellId === cell.id;
    const isExpanded = expandedCellId === cell.id;

    return (
      <Card
        key={cell.id}
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}
        onClick={() => onCellClick(cell.id)}
      >
        <CardHeader className="p-3 pb-2 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
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

          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              T: {cell.config.temperature}
            </Badge>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              L: {cell.config.maxLength}
            </Badge>
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
                cell.messages.map((message) => {
                  if (message.sender === 'user') {
                    return <UserMessage key={message.id} message={message} />;
                  } else {
                    return (
                      <ModelMessage
                        key={message.id}
                        message={message}
                        model={cell.model}
                        primaryColor="#9b87f5"
                        adjustColor={() => "#9b87f5"}
                        temperature={cell.config.temperature}
                      />
                    );
                  }
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`grid gap-4 ${getGridClass()}`}>
      {cells.map(renderCell)}
    </div>
  );
};