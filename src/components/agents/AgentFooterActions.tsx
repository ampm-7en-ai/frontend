
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeploymentDialog from './DeploymentDialog';
import { Agent } from '@/components/agents/modelComparison/types';
import ModelTestLink from './modelComparison/ModelTestLink';

interface AgentFooterActionsProps {
  agent: Agent;
}

const AgentFooterActions = ({ agent }: AgentFooterActionsProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  
  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <ModelTestLink 
          modelInfo={{ 
            model: agent.model,
            label: "Test with Agent",
            openInNewTab: false
          }}
          agentId={agent.id}
          className="w-full"
        />
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
