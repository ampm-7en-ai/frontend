
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';

interface KnowledgeSourceActionsProps {
  sourceId: number;
  sourceStatus: string;
  onRemove: (id: number) => void;
  onTrain: (id: number) => void;
  isTraining: boolean;
}

const KnowledgeSourceActions = ({ 
  sourceId, 
  sourceStatus,
  onRemove, 
  onTrain,
  isTraining
}: KnowledgeSourceActionsProps) => {
  const needsTraining = sourceStatus === 'failed' || sourceStatus === 'none';

  return (
    <div className="flex gap-2">
      {needsTraining && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs"
          disabled={isTraining}
          onClick={() => onTrain(sourceId)}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isTraining ? 'animate-spin' : ''}`} />
          Train
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onRemove(sourceId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default KnowledgeSourceActions;
