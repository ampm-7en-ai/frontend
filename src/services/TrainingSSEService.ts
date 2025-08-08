import { getAccessToken } from '@/utils/api-config';

export interface SSETrainingEvent {
  event: 'training_connected' | 'training_progress' | 'training_completed' | 'training_failed';
  data: {
    agent_id: string;
    task_id: string; // We'll add this locally
    agent_name?: string;
    status: 'training' | 'completed' | 'failed';
    progress?: number; // 0-100
    message?: string;
    error?: string;
    timestamp: string;
  };
}

export type SSEEventCallback = (event: SSETrainingEvent) => void;

class TrainingSSEService {
  private eventSource: EventSource | null = null;
  private callbacks: Map<string, SSEEventCallback> = new Map();
  private taskMappings: Map<string, string> = new Map(); // agentId -> taskId
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Subscribe to training status updates for a specific agent
   */
  subscribe(agentId: string, taskId: string, callback: SSEEventCallback): void {
    const token = getAccessToken();
    if (!token) {
      console.error('Authentication required for SSE connection');
      return;
    }

    // Store callback and task mapping
    const callbackKey = agentId;
    this.callbacks.set(callbackKey, callback);
    this.taskMappings.set(agentId, taskId);

    // Create SSE connection
    this.connect(agentId, token);
  }

  /**
   * Unsubscribe from training status updates
   */
  unsubscribe(agentId: string, taskId: string): void {
    this.callbacks.delete(agentId);
    this.taskMappings.delete(agentId);
    
    // Close connection if no more callbacks
    if (this.callbacks.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Create SSE connection - Updated to match backend endpoint
   */
  private connect(agentId: string, token: string): void {
    try {
      // Close existing connection
      this.disconnect();

      // Backend endpoint: /api/ai/train-status/{agentId}
      const testUrl = `https://api-staging.7en.ai/api/demo/sse/`
      const sseUrl = `https://api-staging.7en.ai/api/ai/train-status/${agentId}`;
      const urlWithAuth = `${testUrl}?token=${token}`;
      
      this.eventSource = new EventSource(urlWithAuth);

      // Handle connection open
      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened:', event);
        this.reconnectAttempts = 0;
      };

      // Handle incoming messages (for generic message events)
      this.eventSource.onmessage = (event) => {
        try {
          console.log("SSE event",event);
          const data = JSON.parse(event.data);
          console.log('Generic SSE message:', data);
        } catch (error) {
          console.error('Error parsing SSE event data:', error);
        }
      };

      // Handle connection errors
      this.eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        this.handleConnectionError(agentId, token);
      };

      // Setup backend-specific event listeners
      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  }

  /**
   * Setup event listeners matching backend events
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Backend sends: training_connected
    this.eventSource.addEventListener('training_connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Training connected:', data);
        // Could emit this as a separate event if needed
      } catch (error) {
        console.error('Error parsing training_connected event:', error);
      }
    });

    // Backend sends: training_training (normalize to training_progress)
    this.eventSource.addEventListener('training_training', (event) => {
      try {
        const backendData = JSON.parse(event.data);
        const eventData: SSETrainingEvent = {
          event: 'training_progress',
          data: {
            ...backendData,
            task_id: this.taskMappings.get(backendData.agent_id) || 'unknown',
            status: 'training'
          }
        };
        this.handleSSEEvent(eventData);
      } catch (error) {
        console.error('Error parsing training_training event:', error);
      }
    });

    // Backend sends: training_completed
    this.eventSource.addEventListener('training_completed', (event) => {
      try {
        const backendData = JSON.parse(event.data);
        const eventData: SSETrainingEvent = {
          event: 'training_completed',
          data: {
            ...backendData,
            task_id: this.taskMappings.get(backendData.agent_id) || 'unknown',
            status: 'completed'
          }
        };
        this.handleSSEEvent(eventData);
      } catch (error) {
        console.error('Error parsing training_completed event:', error);
      }
    });

    // Backend sends: training_failed
    this.eventSource.addEventListener('training_failed', (event) => {
      try {
        const backendData = JSON.parse(event.data);
        const eventData: SSETrainingEvent = {
          event: 'training_failed',
          data: {
            ...backendData,
            task_id: this.taskMappings.get(backendData.agent_id) || 'unknown',
            status: 'failed'
          }
        };
        this.handleSSEEvent(eventData);
      } catch (error) {
        console.error('Error parsing training_failed event:', error);
      }
    });
  }

  /**
   * Handle SSE events and notify callbacks
   */
  private handleSSEEvent(event: SSETrainingEvent): void {
    const callback = this.callbacks.get(event.data.agent_id);
    
    if (callback) {
      callback(event);
    }

    // Log event for debugging
    console.log('Received SSE event:', event);
  }

  /**
   * Handle connection errors and implement reconnection logic
   */
  private handleConnectionError(agentId: string, token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect SSE (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.callbacks.size > 0) {
          this.connect(agentId, token);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.disconnect();
    }
  }

  /**
   * Disconnect SSE connection
   */
  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Check if SSE connection is active
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'open' | 'closed' {
    if (!this.eventSource) return 'closed';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'open';
      case EventSource.CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }
}

// Export singleton instance
export const trainingSSEService = new TrainingSSEService();
