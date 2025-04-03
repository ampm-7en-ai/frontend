
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeploymentDialog from './DeploymentDialog';
import { Agent } from '@/hooks/useAgentFiltering';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

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
  
  // Get the reason why deployment is disabled
  const getDeployDisabledReason = () => {
    if (agent.status === 'Training') {
      return 'Agent is currently training. Please wait until training is complete.';
    } else if (agent.status === 'Error') {
      return 'Agent has errors that need to be resolved before deployment.';
    }
    return '';
  };
  
  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link 
            to={`/agents/${agent.id}/test`} 
            className="flex items-center justify-center" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Playground
          </Link>
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
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
            </TooltipTrigger>
            {!canDeploy && (
              <TooltipContent side="top">
                <p>{getDeployDisabledReason()}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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
