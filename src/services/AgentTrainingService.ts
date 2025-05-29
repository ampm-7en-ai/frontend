
import { getAccessToken, getAuthHeaders, BASE_URL } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationTypes } from '@/types/notification';

export interface TrainingResponse {
  message: string;
  vector_store: string;
}

export const AgentTrainingService = {
  async trainAgent(agentId: string, knowledgeSources: number[] = [], agentName: string, selectedUrls: string[] = []): Promise<boolean> {
   // console.log("Training agent started:", { agentId, agentName, knowledgeSources });
    
    // Problem: We can't use hooks like useNotifications inside a regular function
    // Solution: We need to accept the addNotification function as a parameter
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
      // Add a training started notification
      // This needs to be done by the calling component
      
      const response = await fetch(`${BASE_URL}ai/train-agent/`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          agent_id: agentId,
          knowledge_sources: knowledgeSources,
          selected_urls: selectedUrls
        })
      });
      
      console.log("Training API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Train agent request failed:", errorText);
        throw new Error(errorText || "Train agent request failed.");
      }
      
      const data: TrainingResponse = await response.json();
      console.log("Training completed successfully:", data);
      
      // The notification should be added by the calling component
      toast({
        title: "Training Complete",
        description: data.message || `${agentName} training completed successfully.`,
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
