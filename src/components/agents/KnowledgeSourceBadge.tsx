
import React from 'react';
import { BookOpen, Database, Globe, AlertTriangle, Link2Off } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

interface KnowledgeSourceBadgeProps {
  source: KnowledgeSource;
  onClick?: () => void;
}

const KnowledgeSourceBadge = ({ source, onClick }: KnowledgeSourceBadgeProps) => {
  const getIcon = () => {
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

  const getBadgeStyle = () => {
    if (source.linkBroken) {
      return 'bg-orange-50 text-orange-700 hover:bg-orange-100';
    } else if (source.hasError) {
      return 'bg-red-50 text-red-700 hover:bg-red-100';
    } else {
      return 'bg-primary/5 text-primary hover:bg-primary/10';
    }
  };
  
  const getTextColor = () => {
    if (source.linkBroken) {
      return 'text-orange-500';
    } else if (source.hasError) {
      return 'text-red-500';
    } else {
      return 'text-primary';
    }
  };

  const getTooltipContent = () => {
    if (source.linkBroken) {
      return 'Knowledge source link is broken';
    } else if (source.hasError) {
      return 'Knowledge source needs retraining';
    } else {
      return `Type: ${source.type}`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors duration-200 cursor-pointer ${getBadgeStyle()}`}
            onClick={onClick}
          >
            <span className={getTextColor()}>
              {getIcon()}
            </span>
            <span className="text-xs font-medium">{source.name}</span>
            {source.hasError && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
            {source.linkBroken && (
              <Link2Off className="h-3 w-3 text-orange-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KnowledgeSourceBadge;
