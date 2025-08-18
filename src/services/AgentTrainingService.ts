import { getAccessToken, getAuthHeaders, BASE_URL } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';
import { startPollingAgent } from '@/utils/trainingPoller';
import { trainingSSEService, SSETrainingEvent } from './TrainingSSEService';
export interface TrainingResponse {
  message: string;
  task_id: string;
}

// Local storage key for training tasks
const TRAINING_TASKS_KEY = 'agent_training_tasks';

// Helper function to get training tasks from localStorage
const getTrainingTasks = (): Record<string, { taskId: string; agentName: string; timestamp: number; status: string }> => {
  try {
    const tasks = localStorage.getItem(TRAINING_TASKS_KEY);
    return tasks ? JSON.parse(tasks) : {};
  } catch (error) {
    console.error('Error parsing training tasks from localStorage:', error);
    return {};
  }
};

// Helper function to save training task to localStorage
const saveTrainingTask = (agentId: string, taskId: string, agentName: string) => {
  try {
    const tasks = getTrainingTasks();
    tasks[agentId] = {
      taskId,
      agentName,
      timestamp: Date.now(),
      status: 'Training'
    };
    localStorage.setItem(TRAINING_TASKS_KEY, JSON.stringify(tasks));
    console.log('Saved training task to localStorage:', { agentId, taskId, agentName });
  } catch (error) {
    console.error('Error saving training task to localStorage:', error);
  }
};

// Helper function to remove training task from localStorage
const removeTrainingTask = (agentId: string) => {
  try {
    const tasks = getTrainingTasks();
    if (tasks[agentId]) {
      delete tasks[agentId];
      localStorage.setItem(TRAINING_TASKS_KEY, JSON.stringify(tasks));
      console.log('Removed training task from localStorage:', { agentId });
    }
  } catch (error) {
    console.error('Error removing training task from localStorage:', error);
  }
};

export const AgentTrainingService = {
  async trainAgent(agentId: string, knowledgeSources: number[] = [], agentName: string, selectedUrls: string[] = [], refetchAgentData?: () => Promise<void>): Promise<boolean> {
    const token = getAccessToken();
    if (!token) {
      console.error("Authentication required for training agent");
      toast({
        title: "Authentication required",
        description: "Please log in again to continue.",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }
    
    try {
      const response = await fetch(`${BASE_URL}ai/train-agent/`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          agent_id: agentId,
          knowledge_sources: knowledgeSources,
          selected_urls: selectedUrls
        })
      });
      const res = await response.json();
      
      if (!response.ok) {
        const errorText = res.error;
        throw new Error(errorText || "Train agent request failed.");
      }
      
      // Save the task_id to localStorage
      if (res.task_id) {
        saveTrainingTask(agentId, res.task_id, agentName);


        //subscribe to SSE updates
        this.subscribeToTrainingUpdates(agentId, res.task_id, agentName);
        
        // Start simple polling with refetch callback - ensure it's passed correctly
        // startPollingAgent(agentId, (status, message) => {
        // console.log("Training status received:", { status, message });
          
        //   if (status === 'Active') {
        //     console.log(`Training completed for agent ${agentId}.`);
        //     removeTrainingTask(agentId);
            
        //     toast({
        //       title: "Training Completed",
        //       description: `${agentName} training completed successfully.`,
        //       variant: "default"
        //     });
            
        //   } else if (status === 'Issues') {
        //     console.log(`Training failed for agent ${agentId}.`);
        //     removeTrainingTask(agentId);
            
        //     toast({
        //       title: "Training Failed", 
        //       description: `${agentName} training encountered issues.`,
        //       variant: "destructive"
        //     });
        //   }
        // }, refetchAgentData);
      }
      
      toast({
        title: "Training Started",
        description: res.message || `${agentName} training started successfully.`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Training failed:", error);
      updateTrainingTaskStatus(agentId, 'failed');
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "An error occurred while training agent.",
        variant: "destructive"
      });
      
      return false;
    }
  },
  
  /**
   * Subscribe to real-time training updates via SSE
   */
  subscribeToTrainingUpdates(agentId: string, taskId: string, agentName: string): void {
    const callback = (event: SSETrainingEvent) => {
      switch (event.event) {
        case 'training_connected':
          updateTrainingTaskStatus(agentId, 'training');
          toast({
            title: "Training Started",
            description: `Training has started for ${agentName}`,
            variant: "default"
          });
          break;

        case 'training_progress':
          // Update progress if your UI supports it
          console.log(`Training progress: ${event.data.progress}%`);
          break;

        case 'training_completed':
          updateTrainingTaskStatus(agentId, 'completed');
          toast({
            title: "Training Complete",
            description: `${agentName} training completed successfully!`,
            variant: "default"
          });
          // Unsubscribe after completion
          trainingSSEService.unsubscribe(agentId, taskId);
          break;

        case 'training_failed':
          updateTrainingTaskStatus(agentId, 'failed');
          toast({
            title: "Training Failed",
            description: event.data.error || `${agentName} training failed.`,
            variant: "destructive"
          });
          // Unsubscribe after failure
          trainingSSEService.unsubscribe(agentId, taskId);
          break;

        case 'training_failed':
          updateTrainingTaskStatus(agentId, 'failed'); // Or add 'cancelled' status
          toast({
            title: "Training Cancelled",
            description: `${agentName} training was cancelled.`,
            variant: "default"
          });
          // Unsubscribe after cancellation
          trainingSSEService.unsubscribe(agentId, taskId);
          break;
      }
    };

    trainingSSEService.subscribe(agentId, taskId, callback);
  },

  /**
   * Unsubscribe from training updates
   */
  unsubscribeFromTrainingUpdates(agentId: string, taskId: string): void {
    trainingSSEService.unsubscribe(agentId, taskId);
  },

  async cancelTraining(agentId: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    
    try {
      const response = await fetch(`${BASE_URL}ai/cancel-training`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          agent_id: agentId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Cancel training request failed.");
      }
      
      toast({
        title: "Training cancelled",
        description: "Agent training has been cancelled.",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Failed to cancel training",
        description: error instanceof Error ? error.message : "An error occurred while cancelling training.",
        variant: "destructive"
      });
      
      return false;
    }
  },

  // Get training task for specific agent
  getTrainingTask: (agentId: string) => {
    const tasks = getTrainingTasks();
    return tasks[agentId] || null;
  },

  // Get all training tasks
  getAllTrainingTasks: () => {
    return getTrainingTasks();
  },

  // Remove training task (for external use)
  removeTask: (agentId: string) => {
    removeTrainingTask(agentId);
  }
};
function updateTrainingTaskStatus(agentId: string, arg1: string) {
  throw new Error('Function not implemented.');
}

