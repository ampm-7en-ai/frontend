
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import KnowledgeSourceModal from './KnowledgeSourceModal';
import { KnowledgeSource } from '@/hooks/useAgentFiltering';
import { Button } from '@/components/ui/button';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  
  const displayedSources = knowledgeSources.slice(0, 3);
  const remainingSources = knowledgeSources.length - 3;
  const hasErrorSources = knowledgeSources.some(source => source.hasError);
  
  const handleSourceClick = (source: KnowledgeSource) => {
    setSelectedSourceId(source.id);
    
    if (asFlyout) {
      if (onViewSource) {
        onViewSource(source.id);
      }
    } else {
      setIsModalOpen(true);
    }
  };
  
  // For regular inline display
  if (!asFlyout) {
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
                    onClick={() => setIsModalOpen(true)}
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
        
        <KnowledgeSourceModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
          sources={knowledgeSources} 
          initialSourceId={selectedSourceId}
        />
      </div>
    );
  }
  
  // For flyout display (simplified with button to open modal)
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
            <div className="flex items-center gap-2">
              <KnowledgeSourceBadge source={source} />
            </div>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setIsModalOpen(true)}
      >
        View All Sources
      </Button>
      
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
      
      <KnowledgeSourceModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        sources={knowledgeSources} 
        initialSourceId={selectedSourceId}
      />
    </div>
  );
};

export default AgentKnowledgeSection;
