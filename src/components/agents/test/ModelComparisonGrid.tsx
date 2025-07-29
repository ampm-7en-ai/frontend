
import React from 'react';
import { ModelComparisonCard } from '@/components/agents/modelComparison/ModelComparisonCard';

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
  isHistoryMode: boolean;
  renderEmailCollection?: (message: any, modelIndex: number) => React.ReactNode;
}

export const ModelComparisonGrid = ({
  cells,
  onCellClick,
  onModelChange,
  onConfigClick,
  selectedCellId,
  expandedCellId,
  onToggleExpand,
  isHistoryMode,
  renderEmailCollection
}: ModelComparisonGridProps) => {
  return (
    <div className="h-full p-6 overflow-auto">
      <div className={`grid gap-6 h-full ${
        cells.length === 1 ? 'grid-cols-1' :
        cells.length === 2 ? 'grid-cols-2' :
        cells.length === 3 ? 'grid-cols-3' :
        cells.length === 4 ? 'grid-cols-2 grid-rows-2' :
        cells.length === 5 ? 'grid-cols-3 grid-rows-2' :
        'grid-cols-3 grid-rows-2'
      }`}>
        {cells.map((cell, index) => (
          <ModelComparisonCard
            key={cell.id}
            id={cell.id}
            model={cell.model}
            config={cell.config}
            messages={cell.messages}
            isLoading={cell.isLoading}
            isSelected={selectedCellId === cell.id}
            isExpanded={expandedCellId === cell.id}
            isHistoryMode={isHistoryMode}
            onCellClick={() => onCellClick(cell.id)}
            onModelChange={(model) => onModelChange(cell.id, model)}
            onConfigClick={() => onConfigClick(cell.id)}
            onToggleExpand={() => onToggleExpand(cell.id)}
            renderEmailCollection={(message) => renderEmailCollection?.(message, index)}
          />
        ))}
      </div>
    </div>
  );
};
