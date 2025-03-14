
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import KnowledgeSourceBadge from './KnowledgeSourceBadge';

interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon: string;
  hasError: boolean;
  isDeleted?: boolean;
  isBroken?: boolean;
}

interface AgentKnowledgeSectionProps {
  agentId: string;
  knowledgeSources: KnowledgeSource[];
}

const AgentKnowledgeSection = ({ agentId, knowledgeSources }: AgentKnowledgeSectionProps) => {
  const displayedSources = knowledgeSources.slice(0, 3); // Show up to 3 sources
  const remainingSources = knowledgeSources.length - 3;
  
  const hasErrorSources = knowledgeSources.some(source => source.hasError);
  const hasBrokenSources = knowledgeSources.some(source => source.isBroken);
  const hasDeletedSources = knowledgeSources.some(source => source.isDeleted);
  
  const hasProblematicSources = hasErrorSources || hasBrokenSources || hasDeletedSources;
  
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
      
      {hasProblematicSources && (
        <div className="mt-2">
          <Link 
            to={`/agents/${agentId}/edit?tab=knowledge`}
            className="group inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200 text-xs"
          >
            <span className="flex items-center gap-1">
              {hasDeletedSources && <AlertCircle className="h-3 w-3 text-red-500" />}
              {hasBrokenSources && <AlertTriangle className="h-3 w-3 text-amber-500" />}
              <span className="font-medium">
                {hasDeletedSources 
                  ? "Some knowledge sources have been deleted" 
                  : hasBrokenSources 
                    ? "Some knowledge sources are broken"
                    : "Some knowledge sources need attention"}
              </span>
            </span>
            <RefreshCw className="h-3 w-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AgentKnowledgeSection;
