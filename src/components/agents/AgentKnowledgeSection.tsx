
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
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
      
      {knowledgeSources.some(source => source.hasError) && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Some knowledge sources need retraining
        </div>
      )}
    </div>
  );
};

export default AgentKnowledgeSection;
