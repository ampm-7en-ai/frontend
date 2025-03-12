
import React from 'react';
import { BookOpen, Database, Globe, AlertTriangle } from 'lucide-react';
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
  const getIcon = () => {
    switch (source.type) {
      case 'document':
        return <BookOpen className="h-3.5 w-3.5" />;
      case 'database':
        return <Database className="h-3.5 w-3.5" />;
      case 'webpage':
        return <Globe className="h-3.5 w-3.5" />;
      default:
        return <BookOpen className="h-3.5 w-3.5" />;
    }
  };

  return (
    <TooltipProvider key={source.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 mr-2 mb-2 rounded-full 
              transition-colors duration-200
              ${source.hasError 
                ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                : 'bg-primary/5 text-primary hover:bg-primary/10'
              }
            `}
          >
            <span className={`${source.hasError ? 'text-red-500' : 'text-primary'}`}>
              {getIcon()}
            </span>
            <span className="text-xs font-medium">{source.name}</span>
            {source.hasError && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            )}
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
