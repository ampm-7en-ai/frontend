
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Rocket, Check, FolderSync } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeploymentDialog from './DeploymentDialog';
import { Agent } from '@/hooks/useAgentFiltering';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useTrainingStatus } from '@/context/TrainingStatusContext';
import { TrainingProgressIndicator } from '@/components/ui/training-progress';
import websocketService from '@/services/websocket';

interface AgentFooterActionsProps {
  agent: Agent;
}

const AgentFooterActions = ({ agent }: AgentFooterActionsProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const { toast } = useToast();
  const { getAgentTrainingStatus } = useTrainingStatus();

  // Get the agent's training status from context
  const trainingStatus = getAgentTrainingStatus(agent.id);
  const isTraining = trainingStatus && 
    (trainingStatus.status === 'started' || trainingStatus.status === 'in_progress');

  // Create a minimal agent object for the deployment dialog
  const agentForDialog = {
    id: agent.id,
    name: agent.name
  };

  // Check if the agent is in a state where deployment actions can be performed
  const canDeploy = agent.status !== 'Training' && agent.status !== 'issues';
  const isDeployed = agent.isDeployed || agent.status === 'active';

  // Get the reason why deployment is disabled
  const getDeployDisabledReason = () => {
    if (agent.status === 'Training') {
      return 'Agent is currently training. Please wait until training is complete.';
    } else if (agent.status === 'issues') {
      return 'Agent has errors that need to be resolved before deployment.';
    }
    return '';
  };

  // Subscribe to training status updates for this agent
  useEffect(() => {
    const unsubscribe = websocketService.subscribeToAgentTraining(agent.id, (data) => {
      if (data.status === 'completed') {
        setRetraining(false);
        toast({
          title: "Training completed",
          description: "The agent has been successfully trained and is ready to use.",
          variant: "default"
        });
      } else if (data.status === 'failed') {
        setRetraining(false);
        toast({
          title: "Training failed",
          description: data.error || "There was an error during the training process.",
          variant: "destructive"
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [agent.id, toast]);

  // Handle retrain click for agents with status 'issues'
  const handleRetrain = async () => {
    if (retraining || isTraining) return; // Prevent duplicate retrain requests
    setRetraining(true);

    // Show toast immediately
    toast({
      title: "Retraining started",
      description: "Agent retraining is running in the background. You may continue using the app.",
      variant: "default"
    });

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
      // We don't wait for the backend task to finish as we'll get updates via WebSocket
    } catch (error) {
      toast({
        title: "Retraining failed",
        description: error instanceof Error ? error.message : "An error occurred while retraining the agent.",
        variant: "destructive"
      });
      setRetraining(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        {trainingStatus && trainingStatus.status !== 'idle' && (
          <TrainingProgressIndicator 
            status={trainingStatus.status}
            progress={trainingStatus.progress}
            message={trainingStatus.message}
            error={trainingStatus.error}
            className="mb-2"
          />
        )}
        
        {
          agent.status === 'Active' || agent.status === 'Training' ? (
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
              disabled={retraining || isTraining}
            >
              <FolderSync className={`h-3.5 w-3.5 mr-1 ${(retraining || isTraining) ? 'animate-spin' : ''}`} />
              {(retraining || isTraining) ? 'Retraining...' : 'Retrain'}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full invisible">
              {/* Placeholder button to maintain layout */}
            </Button>
          )
        }

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
