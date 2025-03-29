
import React from 'react';
import { CalendarClock, MessageSquare, ActivitySquare } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AgentActionsDropdown from './AgentActionsDropdown';
import AgentModelBadge from './AgentModelBadge';
import AgentKnowledgeSection from './knowledge/AgentKnowledgeSection';
import AgentFooterActions from './AgentFooterActions';
import { Agent } from '@/hooks/useAgentFiltering';
import { format } from 'date-fns';

interface AgentCardProps {
  agent: Agent;
  getModelBadgeColor: (model: string) => string;
  getStatusBadgeColor: (status: string) => string;
}

const AgentCard = ({ agent, getModelBadgeColor, getStatusBadgeColor }: AgentCardProps) => {
  // Format the date to be more readable (Dec 10, 2023)
  const formattedDate = agent.lastModified ? 
    format(new Date(agent.lastModified), 'MMM d, yyyy') : 
    'Unknown date';
  
  return (
    <Card className="overflow-hidden border flex flex-col h-full">
      <CardHeader className="pb-0 pt-3 px-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-semibold mb-0.5">{agent.name}</CardTitle>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </div>
          <AgentActionsDropdown agentId={agent.id} />
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pt-2 pb-2 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 mt-1">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium">{agent.conversations.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          <div>
            <AgentModelBadge model={agent.model} getModelBadgeColor={getModelBadgeColor} />
          </div>
        </div>
        
        {agent.status && (
          <div className="mb-3">
            <Badge variant="outline" className={`text-xs font-medium py-0 h-4 px-1.5 ${getStatusBadgeColor(agent.status)}`}>
              <ActivitySquare className="h-2.5 w-2.5 mr-0.5" />
              {agent.status}
            </Badge>
          </div>
        )}
        
        <AgentKnowledgeSection 
          agentId={agent.id} 
          knowledgeSources={agent.knowledgeSources} 
        />
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 p-3 mt-auto border-t bg-muted/30">
        <AgentFooterActions agent={agent} />
      </CardFooter>
    </Card>
  );
};

export default AgentCard;
