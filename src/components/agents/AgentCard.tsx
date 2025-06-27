
import React from 'react';
import { CalendarClock, MessageSquare, ActivitySquare, Database, Globe, FileText, BookOpen, Plus } from 'lucide-react';
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
import AgentFooterActions from './AgentFooterActions';
import { Agent } from '@/hooks/useAgentFiltering';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

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

  const getKnowledgeIcon = (type: string) => {
    switch (type) {
      case 'document':
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'webpage':
      case 'website':
      case 'url':
        return <Globe className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="bg-white/30 dark:bg-slate-800/30 rounded-3xl p-1 border border-slate-200/30 dark:border-slate-700/30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
      <Card className="bg-white/60 dark:bg-slate-800/60 rounded-2xl border-0 shadow-none hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 overflow-hidden backdrop-blur-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {agent.name}
                </CardTitle>
                {/* Status Badge */}
                {agent.status && (
                  <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-sm ${getStatusBadgeColor(agent.status)}`}>
                    <ActivitySquare className="h-3 w-3 mr-1.5" />
                    {agent.status}
                  </div>
                )}
              </div>
              <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4">
                {agent.description}
              </CardDescription>
            </div>
            <div className="ml-4 flex-shrink-0">
              <AgentActionsDropdown agentId={agent.id} onDelete={onDelete} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pt-0 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Metrics */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {agent.conversations?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Conversations</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-xl flex items-center justify-center">
                  <CalendarClock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formattedDate}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Last Updated</div>
                </div>
              </div>
            </div>
            
            {/* Middle Column - AI Model */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                AI Model
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
            
            {/* Right Column - Knowledge Sources */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Knowledge Base
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {agent.knowledgeSources?.length || 0} sources
                </div>
              </div>
              
              {agent.knowledgeSources && agent.knowledgeSources.length > 0 ? (
                <div className="space-y-2">
                  {/* Display up to 3 knowledge sources */}
                  <div className="grid grid-cols-1 gap-2">
                    {agent.knowledgeSources.slice(0, 3).map((source, index) => (
                      <div 
                        key={source.id} 
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors"
                      >
                        <div className="text-slate-500 dark:text-slate-400">
                          {getKnowledgeIcon(source.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {source.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                            {source.type}
                          </div>
                        </div>
                        {source.hasError && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {source.hasIssue && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Show "view all" if more than 3 sources */}
                  {agent.knowledgeSources.length > 3 && (
                    <Link 
                      to={`/agents/${agent.id}/edit?tab=knowledge`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      View all {agent.knowledgeSources.length} sources
                    </Link>
                  )}
                </div>
              ) : (
                <Link 
                  to={`/agents/${agent.id}/edit?tab=knowledge`}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                >
                  <Plus className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                  <span className="text-xs text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                    Add Knowledge Sources
                  </span>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-4 border-t border-slate-200/30 dark:border-slate-700/30 bg-slate-50/30 dark:bg-slate-700/30 backdrop-blur-sm">
          <AgentFooterActions agent={agent} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentCard;
