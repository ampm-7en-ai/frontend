
import React from 'react';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon: string;
  hasError: boolean;
}

interface KnowledgeSourceBadgeProps {
  source: KnowledgeSource;
}

const KnowledgeSourceBadge = ({ source }: KnowledgeSourceBadgeProps) => {
  return (
    <TooltipProvider key={source.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-2 py-1 mr-2 mb-2 rounded-md text-xs ${
            source.hasError 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {source.hasError ? (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            ) : (
              <BookOpen className="h-3 w-3" />
            )}
            {source.name}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {source.hasError 
            ? 'Knowledge source needs retraining' 
            : `Type: ${source.type}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KnowledgeSourceBadge;
