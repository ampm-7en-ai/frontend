
import React from 'react';
import { BookOpen, Database, Globe, AlertTriangle, Ban } from 'lucide-react';
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
  isDeleted?: boolean;
  isBroken?: boolean;
}

interface KnowledgeSourceBadgeProps {
  source: KnowledgeSource;
}

const KnowledgeSourceBadge = ({ source }: KnowledgeSourceBadgeProps) => {
  const getIcon = () => {
    if (source.isDeleted) {
      return <Ban className="h-3 w-3" />;
    }
    
    if (source.isBroken) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    
    switch (source.type) {
      case 'document':
        return <BookOpen className="h-3 w-3" />;
      case 'database':
        return <Database className="h-3 w-3" />;
      case 'webpage':
        return <Globe className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const getTooltipText = () => {
    if (source.isDeleted) {
      return 'Source has been deleted and needs to be removed';
    }
    
    if (source.isBroken) {
      return 'Source is broken and needs repair';
    }
    
    if (source.hasError) {
      return 'Knowledge source needs retraining';
    }
    
    return `Type: ${source.type}`;
  };

  const getBadgeStyle = () => {
    if (source.isDeleted) {
      return 'bg-red-50 text-red-700 hover:bg-red-100';
    }
    
    if (source.isBroken) {
      return 'bg-amber-50 text-amber-700 hover:bg-amber-100';
    }
    
    if (source.hasError) {
      return 'bg-red-50 text-red-700 hover:bg-red-100';
    }
    
    return 'bg-primary/5 text-primary hover:bg-primary/10';
  };

  const getIconColor = () => {
    if (source.isDeleted) {
      return 'text-red-500';
    }
    
    if (source.isBroken) {
      return 'text-amber-500';
    }
    
    if (source.hasError) {
      return 'text-red-500';
    }
    
    return 'text-primary';
  };

  return (
    <TooltipProvider key={source.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full 
              transition-colors duration-200 ${getBadgeStyle()}
            `}
          >
            <span className={getIconColor()}>
              {getIcon()}
            </span>
            <span className="text-xs font-medium">{source.name}</span>
            {(source.hasError || source.isBroken || source.isDeleted) && (
              <AlertTriangle className={`h-3 w-3 ${getIconColor()}`} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KnowledgeSourceBadge;
