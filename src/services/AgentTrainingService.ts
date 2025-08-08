
import { getAccessToken, getAuthHeaders, BASE_URL } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';
import { trainingPollingService } from './TrainingPollingService';

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
const updateTrainingTaskStatus = (agentId: string, status: 'completed' | 'failed' | 'training') => {
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
  async trainAgent(agentId: string, knowledgeSources: number[] = [], agentName: string, selectedUrls: string[] = []): Promise<boolean> {
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
        console.log("pipip", res);
        const errorText = res.error;
        throw new Error(errorText || "Train agent request failed.");
      }
      
      // Save the task_id to localStorage with agent information
      if (res.task_id) {
        saveTrainingTask(agentId, res.task_id, agentName);

        // Subscribe to polling updates
        trainingPollingService.subscribe(agentId, res.task_id, (event) => {
          console.log("Polling event received:", event);
          
          // Handle server response: { agent_id: number, training_status: 'issues' | 'training' | 'active' }
          if (event.training_status === 'active') {
            // Training completed - remove from localStorage
            removeTrainingTask(agentId);
            updateTrainingTaskStatus(agentId, 'completed');
          } else if (event.training_status === 'issues') {
            updateTrainingTaskStatus(agentId, 'failed');
          } else if (event.training_status === 'training') {
            updateTrainingTaskStatus(agentId, 'training');
          }
        });
      }
      
      toast({
        title: "Training Started",
        description: res.message || `${agentName} training started successfully.`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Training failed:", error);
      
      // Update status to failed if we have the agentId
      updateTrainingTaskStatus(agentId, 'failed');
      
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "An error occurred while training agent.",
        variant: "destructive"
      });
      
      return false;
    }
  },

  // Subscribe to training updates using polling service
  subscribeToTrainingUpdates(agentId: string, taskId: string, callback: (event: any) => void) {
    console.log(`Subscribing to training updates for agent ${agentId}, task ${taskId}`);
    trainingPollingService.subscribe(agentId, taskId, (pollingEvent) => {
      console.log("Training update received from polling service:", pollingEvent);
      
      // Transform polling event to match expected callback format
      const transformedEvent = {
        agent_id: pollingEvent.agent_id,
        task_id: taskId,
        status: pollingEvent.training_status === 'active' ? 'completed' : 
               pollingEvent.training_status === 'issues' ? 'failed' : 
               pollingEvent.training_status,
        training_status: pollingEvent.training_status,
        message: pollingEvent.message,
        error: pollingEvent.error,
        timestamp: pollingEvent.timestamp
      };
      
      // Handle localStorage updates
      if (pollingEvent.training_status === 'active') {
        removeTrainingTask(agentId);
      } else if (pollingEvent.training_status === 'issues') {
        updateTrainingTaskStatus(agentId, 'failed');
      } else if (pollingEvent.training_status === 'training') {
        updateTrainingTaskStatus(agentId, 'training');
      }
      
      callback(transformedEvent);
    });
  },

  // Unsubscribe from training updates
  unsubscribeFromTrainingUpdates(agentId: string, taskId: string) {
    console.log(`Unsubscribing from training updates for agent ${agentId}, task ${taskId}`);
    trainingPollingService.unsubscribe(agentId, taskId);
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

  // Update task status (for external use)
  updateTaskStatus: (agentId: string, status: 'completed' | 'failed') => {
    updateTrainingTaskStatus(agentId, status);
  },

  // Remove training task (for external use)
  removeTask: (agentId: string) => {
    removeTrainingTask(agentId);
  }
};
