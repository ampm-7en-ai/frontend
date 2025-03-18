
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Link, Trash2 } from 'lucide-react';
import { KnowledgeSource } from '../types';

interface ActionsCellProps {
  source: KnowledgeSource;
  onTrainSource: (id: number) => void;
  onRemoveSource: (id: number) => void;
  onEditUrlSource?: (source: KnowledgeSource) => void;
  shouldShowTrainButton: (source: KnowledgeSource) => boolean;
}

const ActionsCell = ({
  source,
  onTrainSource,
  onRemoveSource,
  onEditUrlSource,
  shouldShowTrainButton
}: ActionsCellProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      {shouldShowTrainButton(source) && source.trainingStatus !== 'training' && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onTrainSource(source.id)}
          className="h-8 px-2"
        >
          <Zap className="h-3.5 w-3.5 mr-1" />
          {source.trainingStatus === 'error' ? 'Retry' : 'Train'}
        </Button>
      )}
      {source.type === 'url' && onEditUrlSource && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEditUrlSource(source)}
          className="h-8 px-2"
        >
          <Link className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => onRemoveSource(source.id)}
        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default ActionsCell;
