import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Play, 
  Rocket, 
  Brain, 
  AlertTriangle, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Check,
  ChevronRight
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const displayedSources = agent.knowledgeSources.slice(0, 2);
  const remainingSources = agent.knowledgeSources.length - 2;
  
  return (
    <Card key={agent.id} className="overflow-hidden border flex flex-col">
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
      </CardHeader>
      <CardContent className="pb-2 flex-1">
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
              {displayedSources.map(source => (
                <KnowledgeSourceBadge key={source.id} source={source} />
              ))}
              {remainingSources > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link 
                        to={`/agents/${agent.id}/edit?tab=knowledge`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 mr-2 mb-2 rounded-full bg-muted/50 hover:bg-muted text-sm text-muted-foreground transition-colors"
                      >
                        +{remainingSources} more
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View all knowledge sources</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
        <div className="flex flex-col gap-2 w-full">
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
