
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeploymentDialog from './DeploymentDialog';
import { Agent } from '@/hooks/useAgentFiltering';

interface AgentFooterActionsProps {
  agent: Agent;
}

const AgentFooterActions = ({ agent }: AgentFooterActionsProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  
  // Create a minimal agent object for the deployment dialog
  const agentForDialog = {
    id: agent.id,
    name: agent.name
  };
  
  // Check if the agent is in a state where deployment actions can be performed
  const canDeploy = agent.status !== 'Training' && agent.status !== 'Error';
  const isDeployed = agent.isDeployed || agent.status === 'Live';
  
  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/agents/${agent.id}/test`} className="flex items-center justify-center">
            <Play className="h-3.5 w-3.5 mr-1" />
            Playground
          </Link>
        </Button>
        <Button 
          variant={isDeployed ? "secondary" : "default"} 
          size="sm" 
          className="w-full"
          onClick={() => setDeploymentDialogOpen(true)}
          disabled={!canDeploy}
        >
          {isDeployed ? (
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
        agent={agentForDialog}
      />
    </>
  );
};

export default AgentFooterActions;
