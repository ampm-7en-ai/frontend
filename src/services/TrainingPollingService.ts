
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
  private finalStatusAgents: Set<string> = new Set(); // Track agents with final status

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
    
    // Remove from final status set if re-subscribing
    this.finalStatusAgents.delete(agentId);
    
    this.callbacks.set(callbackKey, callback);
    console.log(`Subscribed to polling updates for agent ${agentId}, task ${taskId}. Total callbacks: ${this.callbacks.size}`);

    if (!this.isPolling) {
      this.startPolling();
    }
  }

  /**
   * Unsubscribe from training status updates
   */
  unsubscribe(agentId: string, taskId: string): void {
    const callbackKey = `${agentId}_${taskId}`;
    const removed = this.callbacks.delete(callbackKey);
    
    // Add to final status set to prevent further polling
    this.finalStatusAgents.add(agentId);
    
    console.log(`Unsubscribed from polling updates for agent ${agentId}, task ${taskId}. Removed: ${removed}. Remaining callbacks: ${this.callbacks.size}`);

    if (this.callbacks.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Start polling the endpoint
   */
  private startPolling(): void {
    if (this.isPolling) {
      console.log('Polling already active, skipping start');
      return;
    }

    this.isPolling = true;
    console.log(`Starting training status polling every ${this.pollingIntervalMs}ms...`);
    
    // Start immediate poll
    this.poll();
    
    // Set up recurring polling with proper interval
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
    
    // Clear final status tracking
    this.finalStatusAgents.clear();
  }

  /**
   * Perform the polling request
   */
  private async poll() {
    if (!this.isPolling || this.callbacks.size === 0) {
      console.log('Polling stopped or no callbacks, skipping poll request');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error('No authentication token available for polling');
      this.stopPolling();
      return;
    }

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Polling ${this.callbacks.size} agents for training status...`);

    // Create a copy of callbacks to iterate safely
    const callbackEntries = Array.from(this.callbacks.entries());
    const agentsToUnsubscribe: Array<{agentId: string, taskId: string}> = [];

    for (const [callbackKey, callback] of callbackEntries) {
      const [agentId, taskId] = callbackKey.split('_');
      
      // Skip agents that already have final status
      if (this.finalStatusAgents.has(agentId)) {
        console.log(`[${timestamp}] Skipping agent ${agentId} - already has final status`);
        continue;
      }

      const url = `${BASE_URL}ai/train-status/${agentId}/`;

      try {
        console.log(`[${timestamp}] Making polling request to: ${url}`);
        
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
        console.log(`[${timestamp}] Polling response for agent ${agentId}:`, data);

        // Transform the server response to match our interface
        const transformedEvent: PollingTrainingEvent = {
          agent_id: data.agent_id,
          training_status: data.training_status,
          message: data.message,
          error: data.error,
          timestamp: timestamp
        };

        console.log(`[${timestamp}] Training status for agent ${agentId}: ${data.training_status}`);

        // Check if this is a final status that should stop polling for this agent
        if (data.training_status === 'Active' || data.training_status === 'Issues') {
          console.log(`[${timestamp}] Final status received for agent ${agentId}: ${data.training_status}. Marking for unsubscribe.`);
          
          // Add to final status set immediately
          this.finalStatusAgents.add(agentId);
          
          // Call the callback first
          callback(transformedEvent);
          
          // Mark this agent for unsubscription
          agentsToUnsubscribe.push({ agentId, taskId });
          
        } else {
          // Continue polling for this agent
          callback(transformedEvent);
        }
        
      } catch (error) {
        console.error(`[${timestamp}] Polling error for agent ${agentId}:`, error);
        
        // Don't stop polling for network errors, just log them
        if (error instanceof Error && !error.message.includes('401')) {
          console.log('Network error, continuing polling...');
        }
      }
    }

    // Unsubscribe agents with final statuses after all polling requests are complete
    for (const { agentId, taskId } of agentsToUnsubscribe) {
      console.log(`[${timestamp}] Auto-unsubscribing agent ${agentId} due to final status`);
      this.unsubscribe(agentId, taskId);
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

  /**
   * Get current polling interval in milliseconds
   */
  getPollingInterval(): number {
    return this.pollingIntervalMs;
  }
}

// Export singleton instance
export const trainingPollingService = new TrainingPollingService();
