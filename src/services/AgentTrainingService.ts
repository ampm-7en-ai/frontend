
import { getAccessToken, getAuthHeaders, BASE_URL } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';

export interface TrainingResponse {
  message: string;
  task_id: string;
}

// Training task storage utilities
const TRAINING_STORAGE_KEY = 'agent_training_tasks';

interface TrainingTask {
  agentId: string;
  taskId: string;
  agentName: string;
  startTime: string;
  status: 'started' | 'completed' | 'failed';
}

const getTrainingTasks = (): TrainingTask[] => {
  try {
    const stored = localStorage.getItem(TRAINING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading training tasks from localStorage:', error);
    return [];
  }
};

const saveTrainingTask = (task: TrainingTask): void => {
  try {
    const tasks = getTrainingTasks();
    const existingIndex = tasks.findIndex(t => t.agentId === task.agentId);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(tasks));
    console.log('Training task saved to localStorage:', task);
  } catch (error) {
    console.error('Error saving training task to localStorage:', error);
  }
};

export const getTrainingTaskForAgent = (agentId: string): TrainingTask | null => {
  const tasks = getTrainingTasks();
  return tasks.find(t => t.agentId === agentId) || null;
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
      
      const res: TrainingResponse = await response.json();
      
      if (!response.ok) {
        console.log("Training request failed:", res);
        const errorText = (res as any).error || "Train agent request failed.";
        throw new Error(errorText);
      }
      
      // Save training task to localStorage
      const trainingTask: TrainingTask = {
        agentId,
        taskId: res.task_id,
        agentName,
        startTime: new Date().toISOString(),
        status: 'started'
      };
      
      saveTrainingTask(trainingTask);
      
      toast({
        title: "Training Started",
        description: res.message || `${agentName} training started successfully.`,
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Training failed:", error);
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "An error occurred while training agent.",
        variant: "destructive"
      });
      
      return false;
    }
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
  }
};
