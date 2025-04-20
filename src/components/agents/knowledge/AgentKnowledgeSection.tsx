
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw, FileText, BookOpen, Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import KnowledgeSourceBadge from '@/components/agents/KnowledgeSourceBadge';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { Button } from '@/components/ui/button';

interface AgentKnowledgeSectionProps {
  agentId: string;
  knowledgeSources: KnowledgeSource[];
  isCompact?: boolean;
  onViewSource?: (sourceId: number) => void;
}

const AgentKnowledgeSection = ({ 
  agentId, 
  knowledgeSources,
  isCompact = false,
  onViewSource
}: AgentKnowledgeSectionProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  
  const displayedSources = knowledgeSources.slice(0, 3);
  const remainingSources = knowledgeSources.length - 3;
  // Update this line to check hasError property instead of status
  const hasErrorSources = knowledgeSources.some(source => source.hasError);
  const isEmpty = knowledgeSources.length === 0;
  
  const handleSourceClick = (source: KnowledgeSource) => {
    setSelectedSourceId(source.id);
    if (onViewSource) {
      onViewSource(source.id);
    }
  };
  
  // For compact view (button only)
  if (isCompact) {
    return (
      <div className="w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (onViewSource && knowledgeSources.length > 0) {
              onViewSource(knowledgeSources[0].id);
            }
          }}
        >
          <FileText className="h-4 w-4" />
          View Knowledge Sources ({knowledgeSources.length})
        </Button>
      </div>
    );
  }
  
  // Empty state with a creative display
  if (isEmpty) {
    return (
      <div>
        <div className="text-sm font-medium mb-1.5 text-muted-foreground">Knowledge Sources</div>
        <div className="border border-dashed border-muted-foreground/30 rounded-md p-3 bg-muted/20 text-center">
          <div className="flex justify-center items-center mb-2">
            <div className="relative">
              <BookOpen className="h-6 w-6 text-muted-foreground/50" />
              <Bot className="h-4 w-4 absolute -bottom-1 -right-1 text-primary/70" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">No knowledge sources yet</p>
          <Link 
            to={`/agents/${agentId}/edit?tab=knowledge`}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Add knowledge</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }
  
  // For regular inline display with sources
  return (
    <div>
      <div className="text-sm font-medium mb-1.5 text-muted-foreground">Knowledge Sources</div>
      <div className="flex flex-wrap gap-1">
        {displayedSources.map(source => (
          <div key={source.id} onClick={() => handleSourceClick(source)}>
            <KnowledgeSourceBadge source={source} />
          </div>
        ))}
        
        {remainingSources > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto px-2 py-0.5 rounded-full bg-muted/50 hover:bg-muted text-xs text-muted-foreground"
                  onClick={() => {
                    if (onViewSource && knowledgeSources.length > 3) {
                      onViewSource(knowledgeSources[3].id);
                    }
                  }}
                >
                  <span>+{remainingSources} more</span>
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
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
};

export default AgentKnowledgeSection;
