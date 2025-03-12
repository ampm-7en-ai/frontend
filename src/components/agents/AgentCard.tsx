
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Play, 
  Rocket, 
  MessageSquare, 
  Brain, 
  AlertTriangle, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import DeploymentDialog from './DeploymentDialog';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    conversations: number;
    lastModified: string;
    averageRating: number;
    knowledgeSources: Array<{
      id: number;
      name: string;
      type: string;
      icon: string;
      hasError: boolean;
    }>;
    model: string;
    isDeployed: boolean;
  };
  getModelBadgeColor: (model: string) => string;
}

const AgentCard = ({ agent, getModelBadgeColor }: AgentCardProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);

  return (
    <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border group relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot size={18} className="text-primary" />
              </div>
              {agent.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {agent.isDeployed && (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                <Rocket className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
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
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
              <Brain className="h-3 w-3 mr-1" />
              {agent.model}
            </Badge>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2 text-muted-foreground">Knowledge Sources</div>
            <div className="flex flex-wrap">
              {agent.knowledgeSources.map(source => (
                <KnowledgeSourceBadge key={source.id} source={source} />
              ))}
            </div>
            
            {agent.knowledgeSources.some(source => source.hasError) && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Some knowledge sources need retraining
              </div>
            )}
          </div>
          
          <div className="text-sm flex items-center justify-between text-muted-foreground">
            <div>
              <span className="font-medium">{agent.conversations.toLocaleString()}</span> conversations
            </div>
            <div>
              Last updated: {new Date(agent.lastModified).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 p-4 pt-2 mt-2 border-t bg-muted/30">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-2 w-full">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/agents/${agent.id}/test`}>
              <Play className="h-3.5 w-3.5 mr-1" />
              Test
            </Link>
          </Button>
          <Button 
            variant={agent.isDeployed ? "secondary" : "default"} 
            size="sm" 
            className="w-full"
            onClick={() => setDeploymentDialogOpen(true)}
          >
            {agent.isDeployed ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Deployed
              </>
            ) : (
              <>
                <Rocket className="h-3.5 w-3.5 mr-1" />
                Deploy
              </>
            )}
          </Button>
        </div>
      </CardFooter>

      <DeploymentDialog 
        open={deploymentDialogOpen} 
        onOpenChange={setDeploymentDialogOpen} 
        agent={agent} 
      />
    </Card>
  );
};

export default AgentCard;
