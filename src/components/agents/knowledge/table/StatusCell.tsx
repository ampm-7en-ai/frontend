
import React from 'react';
import { KnowledgeSource } from '../types';
import { getStatusIndicator } from '../knowledgeUtils';

interface StatusCellProps {
  source: KnowledgeSource;
}

const StatusCell = ({ source }: StatusCellProps) => {
  if (source.trainingStatus === 'training') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16">
          <div className="w-16 bg-gray-200 rounded-full h-2 flex items-center">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${source.progress || 0}%` }}>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{source.progress}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {getStatusIndicator(source)}
    </div>
  );
};

export default StatusCell;
