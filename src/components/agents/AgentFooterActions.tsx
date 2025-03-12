
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeploymentDialog from './DeploymentDialog';

interface Agent {
  id: string;
  name: string;
  isDeployed: boolean;
  // Add other properties as needed for DeploymentDialog
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
}

interface AgentFooterActionsProps {
  agent: Agent;
}

const AgentFooterActions = ({ agent }: AgentFooterActionsProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  
  return (
    <>
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

      <DeploymentDialog 
        open={deploymentDialogOpen} 
        onOpenChange={setDeploymentDialogOpen}
        agent={agent}
      />
    </>
  );
};

export default AgentFooterActions;
