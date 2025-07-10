
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  MessageSquare, 
  Calendar, 
  FileText,
  Globe,
  FileIcon,
  MoreHorizontal,
  Play,
  Rocket
} from 'lucide-react';
import AgentActionsDropdown from './AgentActionsDropdown';
import DeploymentDialog from './DeploymentDialog';
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

  const getKnowledgeSourceIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'csv':
        return <FileIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <Badge variant={agent.isDeployed ? "success" : "secondary"} className="text-xs">
                {agent.isDeployed ? "Live" : "Idle"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
          </div>
          <AgentActionsDropdown 
            agentId={agent.id} 
            agentName={agent.name}
            onDelete={onDelete}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{agent.conversations}</span>
            <span>Conversations</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(agent.lastModified)}</span>
            <span>Last Updated</span>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="font-medium text-blue-600">{agent.model}</span>
            <span>AI Model</span>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            {agent.knowledgeSources.length} sources
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Knowledge Base</h4>
            <Link to={`/agents/${agent.id}/knowledge`} className="text-xs text-blue-600 hover:text-blue-700">
              + Manage
            </Link>
          </div>
          
          {agent.knowledgeSources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {agent.knowledgeSources.slice(0, 3).map((source) => (
                <div key={source.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getKnowledgeSourceIcon(source.type)}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {source.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{source.type}</div>
                  {source.hasError && (
                    <div className="text-xs text-red-500 mt-1">Error</div>
                  )}
                </div>
              ))}
              {agent.knowledgeSources.length > 3 && (
                <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-center">
                  <span className="text-sm text-gray-500">
                    +{agent.knowledgeSources.length - 3} more
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No knowledge sources added</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/agents/${agent.id}/test`}>
              <Play className="h-4 w-4 mr-1" />
              Test
            </Link>
          </Button>
          <Button 
            variant={agent.isDeployed ? "secondary" : "default"} 
            size="sm"
            onClick={openDeploymentDialog}
          >
            <Rocket className="h-4 w-4 mr-1" />
            {agent.isDeployed ? "Deployed" : "Deploy"}
          </Button>
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
