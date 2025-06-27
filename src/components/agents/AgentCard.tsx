
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
    <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-1 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
      <Card className="bg-white/80 dark:bg-slate-800/80 rounded-xl border-0 shadow-none hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/30 transition-all duration-300 overflow-hidden flex flex-col h-full group backdrop-blur-sm">
        <CardHeader className="p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
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
              <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border backdrop-blur-sm ${getStatusBadgeColor(agent.status)}`}>
                <ActivitySquare className="h-3 w-3 mr-1.5" />
                {agent.status}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="px-5 pt-0 pb-4 flex-1">
          {/* Metrics */}
          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {agent.conversations?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Messages</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CalendarClock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {formattedDate}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Updated</div>
              </div>
            </div>
          </div>
          
          {/* Model Badge */}
          <div className="mb-5">
            <div className="mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Model</span>
            </div>
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
          <div>
            <div className="mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Knowledge Base</span>
            </div>
            <AgentKnowledgeSection 
              agentId={agent.id} 
              knowledgeSources={agent.knowledgeSources} 
            />
          </div>
        </CardContent>
        
        <CardFooter className="p-5 pt-4 mt-auto border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm">
          <AgentFooterActions agent={agent} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentCard;
