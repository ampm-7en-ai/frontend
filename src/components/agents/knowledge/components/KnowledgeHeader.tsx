
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Import, LoaderCircle, Zap } from 'lucide-react';

interface KnowledgeHeaderProps {
  isTrainingAll: boolean;
  onImportClick: () => void;
  onTrainAllClick: () => void;
  sourcesLength: number;
}

const KnowledgeHeader = ({ 
  isTrainingAll, 
  onImportClick,
  onTrainAllClick,
  sourcesLength
}: KnowledgeHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-lg">Knowledge Sources</CardTitle>
        <CardDescription>Connect knowledge sources to your agent to improve its responses</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onImportClick}
          className="flex items-center gap-1"
        >
          <Import className="h-4 w-4" />
          Import Sources
        </Button>
        <Button 
          onClick={onTrainAllClick} 
          disabled={isTrainingAll || sourcesLength === 0}
          size="sm"
          className="flex items-center gap-1"
        >
          {isTrainingAll ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {isTrainingAll ? 'Training...' : 'Train All'}
        </Button>
      </div>
    </CardHeader>
  );
};

export default KnowledgeHeader;
