
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  Play, 
  Rocket, 
  AlertTriangle, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Check
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import DeploymentDialog from './DeploymentDialog';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

interface AgentTableProps {
  agents: Array<{
    id: string;
    name: string;
    description: string;
    conversations: number;
    lastModified: string;
    averageRating: number;
    knowledgeSources: KnowledgeSource[];
    model: string;
    isDeployed: boolean;
  }>;
  getModelBadgeColor: (model: string) => string;
}

const AgentTable = ({ agents, getModelBadgeColor }: AgentTableProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string} | null>(null);

  const openDeploymentDialog = (agent: {id: string, name: string}) => {
    setSelectedAgent(agent);
    setDeploymentDialogOpen(true);
  };

  // Only display top-level knowledge sources in table
  const renderKnowledgeSources = (sources: KnowledgeSource[]) => {
    if (!sources || sources.length === 0) return null;

    const visibleSources = sources.slice(0, 3);
    const remainingCount = sources.length - 3;

    return (
      <div className="flex flex-wrap">
        {visibleSources.map(source => (
          <div key={source.id} className="mr-1 mb-1">
            <KnowledgeSourceBadge source={source} />
          </div>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            +{remainingCount} more
          </Badge>
        )}
        {sources.some(source => source.hasError) && (
          <div className="w-full mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Needs retraining
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Knowledge Sources</TableHead>
            <TableHead>Conversations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-primary" />
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.description}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {agent.model}
                </Badge>
              </TableCell>
              <TableCell>
                {renderKnowledgeSources(agent.knowledgeSources)}
              </TableCell>
              <TableCell>{agent.conversations.toLocaleString()}</TableCell>
              <TableCell>
                {agent.isDeployed ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    <Rocket className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                    Draft
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/agents/${agent.id}/test`}>
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Link>
                  </Button>
                  <Button 
                    variant={agent.isDeployed ? "secondary" : "default"} 
                    size="sm"
                    onClick={() => openDeploymentDialog({id: agent.id, name: agent.name})}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/agents/${agent.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedAgent && (
        <DeploymentDialog 
          open={deploymentDialogOpen} 
          onOpenChange={setDeploymentDialogOpen} 
          agent={selectedAgent} 
        />
      )}
    </>
  );
};

export default AgentTable;
