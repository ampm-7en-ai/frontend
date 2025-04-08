import React from 'react';
import { BookOpen, Database, Globe, AlertTriangle, Link2Off, FileText } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

export interface KnowledgeSourceBadgeProps {
  source: {
    name: string;
    type: string;
    id?: number;
    size?: string;
    lastUpdated?: string;
    trainingStatus?: 'idle' | 'training' | 'success' | 'error';
    linkBroken?: boolean;
    hasError?: boolean;
  };
  onClick?: () => void;
  size?: 'sm' | 'md';
}

const KnowledgeSourceBadge = ({ source, onClick, size = 'md' }: KnowledgeSourceBadgeProps) => {
  const getIcon = () => {
    switch (source.type) {
      case 'document':
      case 'pdf':
        return <FileText className={size === 'sm' ? "h-2.5 w-2.5" : "h-3 w-3"} />;
      case 'database':
        return <Database className={size === 'sm' ? "h-2.5 w-2.5" : "h-3 w-3"} />;
      case 'webpage':
      case 'website':
      case 'url':
        return <Globe className={size === 'sm' ? "h-2.5 w-2.5" : "h-3 w-3"} />;
      default:
        return <BookOpen className={size === 'sm' ? "h-2.5 w-2.5" : "h-3 w-3"} />;
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

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-0.5 text-xs';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center gap-1.5 rounded-full transition-colors duration-200 cursor-pointer ${getBadgeStyle()} ${sizeClasses}`}
            onClick={onClick}
          >
            <span className={getTextColor()}>
              {getIcon()}
            </span>
            <span className={`font-medium ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>{source.name}</span>
            {source.hasError && (
              <AlertTriangle className={size === 'sm' ? "h-2.5 w-2.5 text-red-500" : "h-3 w-3 text-red-500"} />
            )}
            {source.linkBroken && (
              <Link2Off className={size === 'sm' ? "h-2.5 w-2.5 text-orange-500" : "h-3 w-3 text-orange-500"} />
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
