
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
    <Card className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-none hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/20 transition-all duration-300 overflow-hidden flex flex-col h-full group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium text-slate-900 dark:text-slate-100 mb-2 truncate">
              {agent.name}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 text-sm">
              {agent.description}
            </CardDescription>
          </div>
          <div className="ml-3 flex-shrink-0">
            <AgentActionsDropdown agentId={agent.id} onDelete={onDelete} />
          </div>
        </div>
        
        {/* Status Badge */}
        {agent.status && (
          <div className="mb-3">
            <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${getStatusBadgeColor(agent.status)}`}>
              <ActivitySquare className="h-3 w-3 mr-1" />
              {agent.status}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-6 pt-0 pb-4 flex-1">
        {/* Metrics */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-medium">{agent.conversations?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        {/* Model Badge */}
        <div className="mb-4">
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
            getModelBadgeColor={getModelBadgeColor} 
          />
        </div>
        
        {/* Knowledge Sources */}
        <AgentKnowledgeSection 
          agentId={agent.id} 
          knowledgeSources={agent.knowledgeSources} 
        />
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 p-4 mt-auto border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-100/30 dark:bg-slate-700/30">
        <AgentFooterActions agent={agent} />
      </CardFooter>
    </Card>
  );
};

export default AgentCard;
