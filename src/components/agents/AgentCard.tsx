
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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {agent.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {agent.description}
              </p>
            </div>
          </div>
          <AgentActionsDropdown 
            agentId={agent.id} 
            agentName={agent.name}
            onDelete={onDelete}
          />
        </div>

        <div className="space-y-4">
          {/* Model and Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
              <Brain className="h-3 w-3 mr-1" />
              {agent.model}
            </Badge>
            {agent.isDeployed ? (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                <Rocket className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                Draft
              </Badge>
            )}
          </div>

          {/* Knowledge Sources */}
          {agent.knowledgeSources.length > 0 && (
            <div>
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
                  <Badge variant="outline" className="text-xs">
                    +{agent.knowledgeSources.length - 3} more
                  </Badge>
                )}
              </div>
              {agent.knowledgeSources.some(source => source.hasError) && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Needs retraining
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/agents/${agent.id}/test`}>
                <Play className="h-4 w-4 mr-1" />
                Test
              </Link>
            </Button>
            <Button 
              variant={agent.isDeployed ? "secondary" : "default"} 
              size="sm"
              className="flex-1"
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

      <DeploymentDialog 
        open={deploymentDialogOpen} 
        onOpenChange={setDeploymentDialogOpen} 
        agent={{id: agent.id, name: agent.name}} 
      />
    </>
  );
};

export default AgentCard;
