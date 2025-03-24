
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw, FileText, BookOpen, Database, Globe } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import KnowledgeSourceBadge from './KnowledgeSourceBadge';

interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon?: string;
  hasError: boolean;
  content?: string;
}

interface AgentKnowledgeSectionProps {
  agentId: string;
  knowledgeSources: KnowledgeSource[];
  asFlyout?: boolean;
  onViewSource?: (sourceId: number) => void;
}

const AgentKnowledgeSection = ({ 
  agentId, 
  knowledgeSources, 
  asFlyout = false,
  onViewSource
}: AgentKnowledgeSectionProps) => {
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const displayedSources = knowledgeSources.slice(0, 3); // Show up to 3 sources
  const remainingSources = knowledgeSources.length - 3;
  const hasErrorSources = knowledgeSources.some(source => source.hasError);
  
  const handleSourceClick = (source: KnowledgeSource) => {
    setSelectedSource(source);
    if (onViewSource) {
      onViewSource(source.id);
    }
  };
  
  // For regular inline display
  if (!asFlyout) {
    return (
      <div>
        <div className="text-sm font-medium mb-1.5 text-muted-foreground">Knowledge Sources</div>
        <div className="flex flex-wrap gap-1">
          {displayedSources.map(source => (
            <KnowledgeSourceBadge key={source.id} source={source} />
          ))}
          {remainingSources > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to={`/agents/${agentId}/edit?tab=knowledge`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 hover:bg-muted text-xs text-muted-foreground transition-colors"
                  >
                    +{remainingSources} more
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View all knowledge sources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {hasErrorSources && (
          <div className="mt-2">
            <Link 
              to={`/agents/${agentId}/edit?tab=knowledge`}
              className="group inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200 text-xs"
            >
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="font-medium">Some knowledge sources need retraining</span>
              </span>
              <RefreshCw className="h-3 w-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        )}
      </div>
    );
  }
  
  // For flyout display
  return (
    <div className="p-4 space-y-4">
      <div className="text-sm font-medium">Knowledge Sources</div>
      <div className="grid grid-cols-1 gap-3">
        {knowledgeSources.map(source => (
          <div 
            key={source.id}
            className="flex items-center justify-between p-3 text-sm rounded-md border hover:bg-gray-50 cursor-pointer"
            onClick={() => handleSourceClick(source)}
          >
            <div className="flex items-center">
              {getSourceIcon(source.type)}
              <span className="ml-2">{source.name}</span>
            </div>
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>
      
      {selectedSource && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Source Content</div>
          <div className="p-3 bg-gray-50 rounded-md border overflow-auto max-h-96">
            {selectedSource.content ? (
              <div className="prose prose-sm max-w-none">
                <pre className="text-xs whitespace-pre-wrap">{selectedSource.content}</pre>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">No preview available</div>
            )}
          </div>
        </div>
      )}
      
      {hasErrorSources && (
        <div className="mt-2">
          <Link 
            to={`/agents/${agentId}/edit?tab=knowledge`}
            className="group inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200 text-xs"
          >
            <span className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="font-medium">Some knowledge sources need retraining</span>
            </span>
            <RefreshCw className="h-3 w-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      )}
    </div>
  );
};

function getSourceIcon(type: string) {
  switch (type) {
    case 'document':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'webpage':
      return <Globe className="h-4 w-4 text-green-500" />;
    case 'database':
      return <Database className="h-4 w-4 text-purple-500" />;
    default:
      return <BookOpen className="h-4 w-4 text-gray-500" />;
  }
}

export default AgentKnowledgeSection;
