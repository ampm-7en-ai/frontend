
import { getAccessToken, getAuthHeaders, BASE_URL } from '@/utils/api-config';
import { webSocketService } from './WebSocketService';
import { toast } from '@/hooks/use-toast';

export const AgentTrainingService = {
  async trainAgent(agentId: string, includeEmail: boolean = true): Promise<boolean> {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    
    try {
      const response = await fetch(`${BASE_URL}ai/train-agent`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          agent_id: agentId,
          notification_preferences: {
            email: includeEmail,
            in_app: true
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Train agent request failed.");
      }
      
      const data = await response.json();
      
      // Show initial toast
      toast({
        title: "Training started",
        description: "Agent training is running in the background. You'll be notified when it's complete.",
        variant: "default"
      });
      
      // Make sure WebSocket connection is established to receive updates
      webSocketService.connect();
      
      return true;
    } catch (error) {
      toast({
        title: "Training failed to start",
        description: error instanceof Error ? error.message : "An error occurred while starting agent training.",
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
