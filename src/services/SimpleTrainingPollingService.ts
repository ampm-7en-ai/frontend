
import { BASE_URL, getAccessToken } from '@/utils/api-config';

export interface TrainingStatusEvent {
  agent_id: number;
  training_status: 'Training' | 'Active' | 'Issues';
  message?: string;
  error?: string;
  timestamp: string;
}

export type StatusCallback = (event: TrainingStatusEvent) => void;

class SimpleTrainingPollingService {
  private pollInterval: NodeJS.Timeout | null = null;
  private currentAgentId: string | null = null;
  private currentTaskId: string | null = null;
  private callback: StatusCallback | null = null;
  private isPolling = false;
  private readonly pollingIntervalMs = 5000; // 5 seconds

  /**
   * Start polling for a specific agent's training status
   */
  startPollingForAgent(agentId: string, taskId: string, callback: StatusCallback): void {
    console.log(`Starting simple polling for agent ${agentId}, task ${taskId}`);
    
    // Stop any existing polling
    this.stopPolling();
    
    // Set up new polling
    this.currentAgentId = agentId;
    this.currentTaskId = taskId;
    this.callback = callback;
    this.isPolling = true;
    
    // Start immediate poll
    this.poll();
    
    // Set up recurring polling
    this.pollInterval = setInterval(() => {
      this.poll();
    }, this.pollingIntervalMs);
  }

  /**
   * Stop polling completely
   */
  stopPolling(): void {
    console.log('Stopping simple training polling');
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    this.isPolling = false;
    this.currentAgentId = null;
    this.currentTaskId = null;
    this.callback = null;
  }

  /**
   * Perform the actual polling request
   */
  private async poll(): Promise<void> {
    if (!this.isPolling || !this.currentAgentId || !this.callback) {
      console.log('Polling stopped or no agent/callback available');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error('No authentication token available for polling');
      this.stopPolling();
      return;
    }

    const timestamp = new Date().toISOString();
    const url = `${BASE_URL}ai/train-status/${this.currentAgentId}/`;

    try {
      console.log(`[${timestamp}] Polling agent ${this.currentAgentId} status...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed, stopping polling');
          this.stopPolling();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${timestamp}] Status response for agent ${this.currentAgentId}:`, data);

      // Create the event
      const event: TrainingStatusEvent = {
        agent_id: data.agent_id,
        training_status: data.training_status,
        message: data.message,
        error: data.error,
        timestamp: timestamp
      };

      // Call the callback with the event
      this.callback(event);

      // If status is final (Active or Issues), stop polling
      if (data.training_status === 'Active' || data.training_status === 'Issues') {
        console.log(`[${timestamp}] Final status '${data.training_status}' received for agent ${this.currentAgentId}. Stopping polling.`);
        this.stopPolling();
      }
      
    } catch (error) {
      console.error(`[${timestamp}] Polling error for agent ${this.currentAgentId}:`, error);
      
      // Continue polling on network errors (except auth errors)
      if (error instanceof Error && !error.message.includes('401')) {
        console.log('Network error, continuing polling...');
      }
    }
  }

  /**
   * Check if currently polling
   */
  isConnected(): boolean {
    return this.isPolling;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'open' | 'closed' {
    return this.isPolling ? 'open' : 'closed';
  }

  /**
   * Get current agent being polled
   */
  getCurrentAgent(): string | null {
    return this.currentAgentId;
  }
}

// Export singleton instance
export const simpleTrainingPollingService = new SimpleTrainingPollingService();
