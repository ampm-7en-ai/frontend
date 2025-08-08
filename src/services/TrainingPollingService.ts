import { BASE_URL, getAccessToken } from '@/utils/api-config';

export interface PollingTrainingEvent {
  agent_id: string;
  task_id: string;
  agent_name?: string;
  status: 'training' | 'active' | 'issues' | string;
  progress?: number;
  message?: string;
  error?: string;
  timestamp: string;
}

export type PollingEventCallback = (event: PollingTrainingEvent) => void;

class TrainingPollingService {
  private callbacks: Map<string, PollingEventCallback> = new Map();
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private pollingInterval = 2000; // Poll every 2 seconds
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

    if (this.callbacks.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Start polling the endpoint
   */
  private startPolling(): void {
    this.isPolling = true;
    this.poll();
  }

  /**
   * Stop polling the endpoint
   */
  private stopPolling(): void {
    this.isPolling = false;
    this.pollIntervals.forEach((interval) => clearInterval(interval));
    this.pollIntervals.clear();
  }

  /**
   * Perform the polling request
   */
  private async poll() {
    if (!this.isPolling) return;

    const token = getAccessToken();
    if (!token) {
      console.error('No authentication token available for polling');
      this.stopPolling();
      return ;
    }

    for (const [callbackKey] of this.callbacks) {
      const [agentId, taskId] = callbackKey.split('_');
      const url = `${BASE_URL}/ai/train-status/${agentId}/`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json', // Expect JSON response
            'Authorization': `Bearer ${getAccessToken()}`
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PollingTrainingEvent = await response.json();
        const callback = this.callbacks.get(callbackKey);
        if (callback) {
          callback(data);
        }
        console.log('Polled data:', data);
      } catch (error) {
        console.error('Polling error for', url, error);
        // Optionally stop polling on persistent errors
        if (error instanceof Error && error.message.includes('401')) {
          this.stopPolling();
        }
      }
    }

    // Schedule the next poll
    const interval = setInterval(() => this.poll(), this.pollingInterval);
    this.pollIntervals.set('main', interval);
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