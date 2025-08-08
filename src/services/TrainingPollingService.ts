
import { BASE_URL, getAccessToken } from '@/utils/api-config';

export interface PollingTrainingEvent {
  agent_id: number;
  training_status: 'Training' | 'Active' | 'Issues';
  message?: string;
  error?: string;
  timestamp: string;
}

export type PollingEventCallback = (event: PollingTrainingEvent) => void;

class TrainingPollingService {
  private callbacks: Map<string, PollingEventCallback> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private pollingIntervalMs = 5000; // Poll every 5 seconds
  private isPolling = false;

  /**
   * Subscribe to training status updates for a specific agent
   */
  subscribe(agentId: string, taskId: string, callback: PollingEventCallback): void {
    const token = getAccessToken();
    if (!token) {
      console.error('Authentication required for polling connection');
      return;
    }

    const callbackKey = `${agentId}_${taskId}`;
    this.callbacks.set(callbackKey, callback);
    console.log(`Subscribed to polling updates for agent ${agentId}, task ${taskId}`);

    if (!this.isPolling) {
      this.startPolling();
    }
  }

  /**
   * Unsubscribe from training status updates
   */
  unsubscribe(agentId: string, taskId: string): void {
    const callbackKey = `${agentId}_${taskId}`;
    this.callbacks.delete(callbackKey);
    console.log(`Unsubscribed from polling updates for agent ${agentId}, task ${taskId}`);

    if (this.callbacks.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Start polling the endpoint
   */
  private startPolling(): void {
    if (this.isPolling) {
      console.log('Polling already active');
      return;
    }

    this.isPolling = true;
    console.log('Starting training status polling...');
    
    // Start immediate poll
    this.poll();
    
    // Set up recurring polling
    this.pollInterval = setInterval(() => {
      this.poll();
    }, this.pollingIntervalMs);
  }

  /**
   * Stop polling the endpoint
   */
  private stopPolling(): void {
    console.log('Stopping training status polling...');
    this.isPolling = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Perform the polling request
   */
  private async poll() {
    if (!this.isPolling) {
      console.log('Polling stopped, skipping poll request');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error('No authentication token available for polling');
      this.stopPolling();
      return;
    }

    console.log(`Polling ${this.callbacks.size} agents for training status...`);

    for (const [callbackKey] of this.callbacks) {
      const [agentId, taskId] = callbackKey.split('_');
      const url = `${BASE_URL}ai/train-status/${agentId}/`;

      try {
        console.log(`Making polling request to: ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          console.error(`Polling request failed with status: ${response.status}`);
          
          // Handle authentication errors
          if (response.status === 401) {
            console.error('Authentication failed, stopping polling');
            this.stopPolling();
            return;
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Polling response received:', data);

        // Transform the server response to match our interface
        const transformedEvent: PollingTrainingEvent = {
          agent_id: data.agent_id,
          training_status: data.training_status,
          message: data.message,
          error: data.error,
          timestamp: new Date().toISOString()
        };

        const callback = this.callbacks.get(callbackKey);
        if (callback) {
          console.log(`Calling callback for agent ${agentId} with status: ${data.training_status}`);
          callback(transformedEvent);
        } else {
          console.warn(`No callback found for key: ${callbackKey}`);
        }
        
      } catch (error) {
        console.error(`Polling error for agent ${agentId}:`, error);
        
        // Don't stop polling for network errors, just log them
        if (error instanceof Error && !error.message.includes('401')) {
          console.log('Network error, continuing polling...');
        }
      }
    }
  }

  /**
   * Check if polling is active
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
}

// Export singleton instance
export const trainingPollingService = new TrainingPollingService();
