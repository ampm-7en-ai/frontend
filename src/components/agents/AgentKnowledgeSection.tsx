
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
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
}

interface AgentKnowledgeSectionProps {
  agentId: string;
  knowledgeSources: KnowledgeSource[];
}

const AgentKnowledgeSection = ({ agentId, knowledgeSources }: AgentKnowledgeSectionProps) => {
  const displayedSources = knowledgeSources.slice(0, 2);
  const remainingSources = knowledgeSources.length - 2;
  const hasErrorSources = knowledgeSources.some(source => source.hasError);
  
  return (
    <div>
      <div className="text-sm font-medium mb-2 text-muted-foreground">Knowledge Sources</div>
      <div className="flex flex-wrap">
        {displayedSources.map(source => (
          <KnowledgeSourceBadge key={source.id} source={source} />
        ))}
        {remainingSources > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to={`/agents/${agentId}/edit?tab=knowledge`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 mr-2 mb-2 rounded-full bg-muted/50 hover:bg-muted text-sm text-muted-foreground transition-colors"
                >
                  +{remainingSources} more
                  <ChevronRight className="h-3.5 w-3.5" />
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
        <div className="mt-2 flex items-center">
          <Link 
            to={`/agents/${agentId}/edit?tab=knowledge`}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
          >
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-medium">Some knowledge sources need retraining</span>
            </span>
            <RefreshCw className="h-3 w-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AgentKnowledgeSection;
