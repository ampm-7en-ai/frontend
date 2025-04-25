
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Rocket, Check, FolderSync } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeploymentDialog from './DeploymentDialog';
import CleanupDialog from './CleanupDialog';
import { Agent } from '@/hooks/useAgentFiltering';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';

interface AgentFooterActionsProps {
  agent: Agent;
}

const AgentFooterActions = ({ agent }: AgentFooterActionsProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const { toast } = useToast();

  // Check if there are any problematic knowledge sources
  const hasProblematicSources = agent.knowledgeSources?.some(source => source.hasError || source.hasIssue);

  const handleRetrain = async () => {
    if (retraining) return;
    
    // If there are problematic sources, show the cleanup dialog
    if (hasProblematicSources) {
      setCleanupDialogOpen(true);
      return;
    }

    // If no problems, proceed with retraining directly
    setRetraining(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BASE_URL}agents/${agent.id}/retrain/`, {
        method: "POST",
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Retrain request failed.");
      }

      toast({
        title: "Retraining started",
        description: "Agent retraining is running in the background. You may continue using the app.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Retraining failed",
        description: error instanceof Error ? error.message : "An error occurred while retraining the agent.",
        variant: "destructive"
      });
    } finally {
      setRetraining(false);
    }
  };

  // Create a minimal agent object for the deployment dialog
  const agentForDialog = {
    id: agent.id,
    name: agent.name
  };

  const canDeploy = agent.status !== 'Training' && agent.status !== 'issues';
  const isDeployed = agent.isDeployed || agent.status === 'active';

  const getDeployDisabledReason = () => {
    if (agent.status === 'Training') {
      return 'Agent is currently training. Please wait until training is complete.';
    } else if (agent.status === 'issues') {
      return 'Agent has errors that need to be resolved before deployment.';
    }
    return '';
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        {agent.status === 'Active' || agent.status === 'Training' ? (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link
              to={`/agents/${agent.id}/test`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Playground
            </Link>
          </Button>
        ) : agent.status === 'Issues' ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
            onClick={handleRetrain}
            disabled={retraining}
          >
            <FolderSync className={`h-3.5 w-3.5 mr-1 ${retraining ? 'animate-spin' : ''}`} />
            {retraining ? 'Retraining...' : 'Retrain'}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full opacity-50" disabled>
            <Play className="h-3.5 w-3.5 mr-1" />
            Playground
          </Button>
        )}

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

      <CleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        knowledgeSources={agent.knowledgeSources || []}
        agentId={agent.id}
      />
    </>
  );
};

export default AgentFooterActions;
