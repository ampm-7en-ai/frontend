
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  Play, 
  Rocket, 
  AlertTriangle, 
  Check,
  Calendar,
  Star
} from 'lucide-react';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import DeploymentDialog from './DeploymentDialog';
import AgentActionsDropdown from './AgentActionsDropdown';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    conversations: number;
    lastModified: string;
    averageRating: number;
    knowledgeSources: KnowledgeSource[];
    model: string;
    isDeployed: boolean;
    status?: string;
  };
  getModelBadgeColor: (model: string) => string;
  getStatusBadgeColor?: (status: string) => string;
  onDelete?: (agentId: string) => void;
}

const AgentCard = ({ agent, getModelBadgeColor, getStatusBadgeColor, onDelete }: AgentCardProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = React.useState(false);

  const openDeploymentDialog = () => {
    setDeploymentDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <div className="group relative bg-white/10 dark:bg-slate-900/20 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-slate-700/30 p-6 hover:bg-white/20 dark:hover:bg-slate-800/30 transition-all duration-300 hover:border-white/30 dark:hover:border-slate-600/50 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10">
        {/* Glassmorphic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-slate-700/10 rounded-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-xl border border-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {agent.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {agent.description}
                </p>
              </div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm rounded-lg border border-white/20 dark:border-slate-700/30">
              <AgentActionsDropdown 
                agentId={agent.id} 
                agentName={agent.name}
                onDelete={onDelete}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Model and Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-lg border border-white/20 dark:border-slate-700/30 px-3 py-1">
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{agent.model}</span>
                </div>
              </div>
              {agent.isDeployed ? (
                <div className="bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30 px-3 py-1">
                  <div className="flex items-center gap-1">
                    <Rocket className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-500/20 backdrop-blur-sm rounded-lg border border-gray-500/30 px-3 py-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Draft</span>
                </div>
              )}
            </div>

            {/* Knowledge Sources */}
            {agent.knowledgeSources.length > 0 && (
              <div className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-lg border border-white/20 dark:border-slate-700/30 p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Knowledge Sources
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.knowledgeSources.slice(0, 3).map(source => (
                    <KnowledgeSourceBadge key={source.id} source={source} />
                  ))}
                  {agent.knowledgeSources.length > 3 && (
                    <div className="bg-white/20 dark:bg-slate-700/20 backdrop-blur-sm rounded border border-white/20 dark:border-slate-600/30 px-2 py-1">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        +{agent.knowledgeSources.length - 3} more
                      </span>
                    </div>
                  )}
                </div>
                {agent.knowledgeSources.some(source => source.hasError) && (
                  <div className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Needs retraining
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20 dark:border-slate-700/30">
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {agent.conversations.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Conversations</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {renderStars(agent.averageRating)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(agent.lastModified)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Modified</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm border-white/20 dark:border-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-700/30" 
                asChild
              >
                <Link to={`/agents/${agent.id}/test`}>
                  <Play className="h-4 w-4 mr-1" />
                  Test
                </Link>
              </Button>
              <Button 
                variant={agent.isDeployed ? "secondary" : "default"} 
                size="sm"
                className={`flex-1 ${
                  agent.isDeployed 
                    ? 'bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/30' 
                    : 'bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-sm border border-white/20 text-white hover:from-blue-600/80 hover:to-purple-700/80'
                }`}
                onClick={openDeploymentDialog}
              >
                {agent.isDeployed ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Deployed
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-1" />
                    Deploy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DeploymentDialog 
        open={deploymentDialogOpen} 
        onOpenChange={setDeploymentDialogOpen} 
        agent={{id: agent.id, name: agent.name}} 
      />
    </>
  );
};

export default AgentCard;
