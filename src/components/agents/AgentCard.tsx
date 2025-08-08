
import React, { useState } from 'react';
import { CalendarClock, MessageSquare, ActivitySquare, Database, Globe, FileText, BookOpen, Plus, ChevronDown, ChevronUp, Brain } from 'lucide-react';
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
import { Link } from 'react-router-dom';
import ModernButton from '@/components/dashboard/ModernButton';
import { Settings, Play } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  getModelBadgeColor: (model: string) => string;
  getStatusBadgeColor: (status: string) => string;
  onDelete?: (agentId: string) => void;
}

const AgentCard = ({ agent, getModelBadgeColor, getStatusBadgeColor, onDelete }: AgentCardProps) => {
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);
  
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
  
  return (
    <div className="w-full">
      {/* Main Agent Card */}
      <div className="bg-transparent rounded-3xl p-1 border-0 backdrop-blur-md shadow-none hover:shadow-xl transition-all duration-300">
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
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
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
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
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
                      {agent.model.display_name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">AI Model</div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Knowledge Base Trigger */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                  {agent.knowledgeSources?.length || 0} sources
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentCard;
