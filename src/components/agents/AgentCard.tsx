import React, { useState } from 'react';
import { CalendarClock, MessageSquare, ActivitySquare, Database, Globe, FileText, BookOpen, Plus, ChevronDown, ChevronUp, Brain, Settings2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AgentActionsDropdown from './AgentActionsDropdown';
import { Agent } from '@/hooks/useAgentFiltering';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { Settings, Play } from 'lucide-react';
import { TICKETING_PROVIDERS_LOGOS } from '@/utils/integrationUtils';

interface AgentCardProps {
  agent: Agent;
  getModelBadgeColor: (model: string) => string;
  getStatusBadgeColor: (status: string) => string;
  onDelete?: (agentId: string) => void;
}

const AgentCard = ({ agent, getModelBadgeColor, getStatusBadgeColor, onDelete }: AgentCardProps) => {
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);
  const navigate = useNavigate();
  // Format the date to be more readable (Dec 10, 2023)
  const formattedDate = agent.lastModified ? 
    format(new Date(agent.lastModified), 'MMM d, yyyy') : 
    'Unknown date';

  const getKnowledgeIcon = (type: string) => {
    switch (type) {
      case 'document':
      case 'pdf':
        return <FileText className="h-3 w-3" />;
      case 'database':
        return <Database className="h-3 w-3" />;
      case 'webpage':
      case 'website':
      case 'url':
        return <Globe className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const getModelDisplayName = () => {
    return agent.model.display_name === 'gpt4' ? 'GPT-4 (OpenAI)' :
           agent.model.display_name === 'gpt35' ? 'GPT-3.5 Turbo (OpenAI)' :
           agent.model.display_name === 'claude' ? 'Claude 3 (Anthropic)' :
           agent.model.display_name === 'gemini' ? 'Gemini Pro (Google)' :
           agent.model.display_name === 'mistral' ? 'Mistral Large (Mistral AI)' :
           agent.model.display_name === 'llama' ? 'Llama 2 (Meta AI)' :
           agent.model.display_name;
  };

  const getModelStyles = () => {
    const colorName = getModelBadgeColor(agent.model.response_model);
    
    switch (colorName) {
      case 'indigo':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'green':
        return 'text-green-600 dark:text-green-400';
      case 'purple':
        return 'text-purple-600 dark:text-purple-400';
      case 'blue':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const shouldUseCarousel = agent.knowledgeSources && agent.knowledgeSources.length > 4;
  
  const handleDuplicate = async (_agentId: string) => {
    // Refresh the list after duplication
    if (onDelete) {
      onDelete(_agentId);
    }
  };
  
  const handleConfigure = (agentId) => {
    navigate(`/agents/builder/${agentId}`);
  }
  return (
    <div className="w-full">
      {/* Main Agent Card */}
      <div className="bg-transparent rounded-3xl p-1 border-0 backdrop-blur-md shadow-none hover:shadow-xl transition-all duration-300">
        <Card className="bg-white/60 dark:bg-slate-800/60 rounded-2xl border-0 shadow-none hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-pointer" onClick={()=>handleConfigure(agent.id)}>
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
                <AgentActionsDropdown 
                  agentId={agent.id} 
                  agentName={agent.name}
                  onDelete={onDelete}
                  onDuplicate={handleDuplicate}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pt-0 pb-4">
            {/* Single Row - Conversations, Last Updated, AI Model, Knowledge Trigger */}
            <div className="flex items-center justify-between gap-6 mb-4">
              {/* Left side - Metrics */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white/80">
                      {agent.conversations?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Conversations</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg flex items-center justify-center">
                    <CalendarClock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white/80">
                      {formattedDate}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Last Updated</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${getModelStyles()}`}>
                      {getModelDisplayName()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">AI Model</div>
                  </div>
                </div>

                {
                  agent.default_ticketing_provider && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-lg flex items-center justify-center overflow-hidden rounded-2xl">
                        <img src={TICKETING_PROVIDERS_LOGOS[agent.default_ticketing_provider].logo} alt={agent.default_ticketing_provider} className="w-full h-full object-fill" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold dark:text-white/80`}>
                          {agent.default_ticketing_provider}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Connected App</div>
                      </div>
                    </div>
                  )
                }
              </div>
              
              {/* Right side - Knowledge Base Trigger */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                  {agent.knowledgeSources?.length || 0} sources
                </span>
                {/* <Collapsible open={isKnowledgeExpanded} onOpenChange={setIsKnowledgeExpanded}>
                  <CollapsibleTrigger asChild>
                    <ModernButton variant="outline" size="sm" className="h-8 w-8 p-0" iconOnly>
                      {isKnowledgeExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </ModernButton>
                  </CollapsibleTrigger>
                </Collapsible> */}
              </div>
            </div>
          </CardContent>

          {/* Expanded Knowledge Base Section - Full Width */}
          {/* <Collapsible open={isKnowledgeExpanded} onOpenChange={setIsKnowledgeExpanded}>
            <CollapsibleContent>
              <div className="px-6 pb-4">
                <div className="bg-slate-50/80 dark:bg-slate-700/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Knowledge Base
                    </h4>
                    <Link 
                      to={`/agents/builder/${agent.id}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Manage
                    </Link>
                  </div>
                  
                  {agent.knowledgeSources && agent.knowledgeSources.length > 0 ? (
                    shouldUseCarousel ? (
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-2">
                          {agent.knowledgeSources.map((source, index) => (
                            <CarouselItem key={source.id} className="pl-2 basis-1/3 md:basis-1/6">
                              <div className="h-full p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 transition-colors">
                                <div className="flex items-start gap-2">
                                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                                    {getKnowledgeIcon(source.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-0.5">
                                      {source.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mb-1">
                                      {source.type}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {source.hasError && (
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Has errors"></div>
                                      )}
                                      {source.hasIssue && (
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" title="Has issues"></div>
                                      )}
                                      {!source.hasError && !source.hasIssue && (
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Active"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1 h-6 w-6" />
                        <CarouselNext className="right-1 h-6 w-6" />
                      </Carousel>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {agent.knowledgeSources.map((source, index) => (
                          <div 
                            key={source.id}
                            className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                                {getKnowledgeIcon(source.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-0.5">
                                  {source.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mb-1">
                                  {source.type}
                                </div>
                                <div className="flex items-center gap-1">
                                  {source.hasError && (
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Has errors"></div>
                                  )}
                                  {source.hasIssue && (
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" title="Has issues"></div>
                                  )}
                                  {!source.hasError && !source.hasIssue && (
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Active"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <Link 
                      to={`/agents/${agent.id}/edit?tab=knowledge`}
                      className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                    >
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                      <span className="text-xs text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                        Add Knowledge Sources
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible> */}
          
          
        </Card>
      </div>
    </div>
  );
};

export default AgentCard;