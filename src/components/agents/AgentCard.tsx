
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
  onDelete?: (agentId: string) => void;
}

const AgentCard = ({ agent, getModelBadgeColor, getStatusBadgeColor, onDelete }: AgentCardProps) => {
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
          <AgentActionsDropdown agentId={agent.id} onDelete={onDelete} />
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pt-2 pb-2 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 mt-1">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium">{agent.conversations?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          <div>
            <AgentModelBadge 
            model={
              agent.model === 'gpt4' ? 'GPT-4 (OpenAI)' :
              agent.model === 'gpt35' ? 'GPT-3.5 Turbo (OpenAI)' :
              agent.model === 'claude' ? 'Claude 3 (Anthropic)' :
              agent.model === 'gemini' ? 'Gemini Pro (Google)' :
              agent.model === 'mistral' ? 'Mistral Large (Mistral AI)' :
              agent.model === 'llama' ? 'Llama 2 (Meta AI)' :
              agent.model
            } 
            getModelBadgeColor={getModelBadgeColor} />
          </div>
        </div>
        
        {agent.status && (
          <div className="mb-3">
            <div className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium border ${getStatusBadgeColor(agent.status)}`}>
              <ActivitySquare className="h-2.5 w-2.5 mr-0.5" />
              {agent.status}
            </div>
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
