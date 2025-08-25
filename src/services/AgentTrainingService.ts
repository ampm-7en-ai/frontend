import { getAccessToken, getAuthHeaders, BASE_URL } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';
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
      status: 'training'
    };
    localStorage.setItem(TRAINING_TASKS_KEY, JSON.stringify(tasks));
    console.log('Saved training task to localStorage:', { agentId, taskId, agentName });
  } catch (error) {
    console.error('Error saving training task to localStorage:', error);
  }
};

// Helper function to update training task status
const updateTrainingTaskStatus = (agentId: string, status: string) => {
  try {
    const tasks = getTrainingTasks();
    if (tasks[agentId]) {
      tasks[agentId].status = status;
      localStorage.setItem(TRAINING_TASKS_KEY, JSON.stringify(tasks));
      console.log('Updated training task status:', { agentId, status });
    }
  } catch (error) {
    console.error('Error updating training task status:', error);
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

        // Subscribe to SSE updates - NO POLLING
        console.log('🚀 Starting SSE subscription for training updates');
        this.subscribeToTrainingUpdates(agentId, res.task_id, agentName, refetchAgentData);
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
   * Subscribe to real-time training updates via SSE ONLY - no polling
   */
  subscribeToTrainingUpdates(agentId: string, taskId: string, agentName: string, refetchAgentData?: () => Promise<void>): void {
    console.log('📡 Subscribing to SSE training updates for agent:', agentId);
    
    const callback = (event: SSETrainingEvent) => {
      console.log('📡 SSE Training Event received:', event);
      
      switch (event.event) {
        case 'training_connected':
          updateTrainingTaskStatus(agentId, 'training');
          toast({
            title: "Training Connected",
            description: `Training connection established for ${agentName}`,
            variant: "default"
          });
          break;

        case 'training_progress':
          // Update progress - status remains training
          console.log(`📊 Training progress update for ${agentName}`);
          updateTrainingTaskStatus(agentId, 'training');
          break;

        case 'training_completed':
          console.log('✅ Training completed via SSE, updating status and closing connection');
          updateTrainingTaskStatus(agentId, 'completed');
          
          toast({
            title: "Training Complete",
            description: `${agentName} training completed successfully!`,
            variant: "default"
          });
          
          // Refetch agent data if callback provided
          if (refetchAgentData) {
            console.log('🔄 Refetching agent data after SSE training completion');
            refetchAgentData().catch(error => {
              console.error('Error refetching agent data:', error);
            });
          }
          
          // Remove task after a delay to show completion status
          setTimeout(() => {
            removeTrainingTask(agentId);
          }, 5000);
          
          // Immediately close SSE connection
          console.log('🔌 Closing SSE connection after training completion');
          trainingSSEService.unsubscribe(agentId, taskId);
          break;

        case 'training_failed':
          console.log('❌ Training failed via SSE, updating status and closing connection');
          updateTrainingTaskStatus(agentId, 'failed');
          
          toast({
            title: "Training Failed",
            description: event.data.error || `${agentName} training failed.`,
            variant: "destructive"
          });
          
          // Remove task after a delay
          setTimeout(() => {
            removeTrainingTask(agentId);
          }, 5000);
          
          // Immediately close SSE connection
          console.log('🔌 Closing SSE connection after training failure');
          trainingSSEService.unsubscribe(agentId, taskId);
          break;
      }
    };

    // Subscribe to SSE - this is the ONLY method for real-time updates
    trainingSSEService.subscribe(agentId, taskId, callback);
  },

  /**
   * Unsubscribe from training updates
   */
  unsubscribeFromTrainingUpdates(agentId: string, taskId: string): void {
    console.log('🔌 Unsubscribing from SSE training updates for agent:', agentId);
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
      
      // Remove training task from localStorage
      removeTrainingTask(agentId);
      
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
  },

  // Export the helper function for external use
  updateTrainingTaskStatus
};
