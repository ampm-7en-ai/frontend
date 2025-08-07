import { getAccessToken } from '@/utils/api-config';

export interface SSETrainingEvent {
  event: 'training_started' | 'training_progress' | 'training_completed' | 'training_failed' | 'training_cancelled';
  data: {
    agent_id: string;
    task_id: string;
    agent_name?: string;
    status: 'training' | 'completed' | 'failed' | 'cancelled';
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

    // Store callback
    const callbackKey = `${agentId}_${taskId}`;
    this.callbacks.set(callbackKey, callback);

    // Create SSE connection
    this.connect(agentId, taskId, token);
  }

  /**
   * Unsubscribe from training status updates
   */
  unsubscribe(agentId: string, taskId: string): void {
    const callbackKey = `${agentId}_${taskId}`;
    this.callbacks.delete(callbackKey);
    
    // Close connection if no more callbacks
    if (this.callbacks.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Create SSE connection
   */
  private connect(agentId: string, taskId: string, token: string): void {
    try {
      // Close existing connection
      this.disconnect();

      // Create new EventSource connection
      const sseUrl = `https://api-staging.7en.ai/api/ai/train-status/${agentId}`;
      
      // EventSource doesn't support custom headers, so we pass token as query param
      const urlWithAuth = `${sseUrl}?token=${encodeURIComponent(token)}`;
      
      this.eventSource = new EventSource(urlWithAuth);

      // Handle connection open
      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened:', event);
        this.reconnectAttempts = 0;
      };

      // Handle incoming messages
      this.eventSource.onmessage = (event) => {
        try {
          const eventData: SSETrainingEvent = JSON.parse(event.data);
          this.handleSSEEvent(eventData);
        } catch (error) {
          console.error('Error parsing SSE event data:', error);
        }
      };

      // Handle connection errors
      this.eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        this.handleConnectionError();
      };

      // Handle specific event types
      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  }

  /**
   * Setup event listeners for specific event types
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Listen for training_started events
    this.eventSource.addEventListener('training_started', (event) => {
      try {
        const eventData: SSETrainingEvent = {
          event: 'training_started',
          data: JSON.parse(event.data)
        };
        this.handleSSEEvent(eventData);
      } catch (error) {
        console.error('Error parsing training_started event:', error);
      }
    });

    // Listen for training_progress events
    this.eventSource.addEventListener('training_progress', (event) => {
      try {
        const eventData: SSETrainingEvent = {
          event: 'training_progress',
          data: JSON.parse(event.data)
        };
        this.handleSSEEvent(eventData);
      } catch (error) {
        console.error('Error parsing training_progress event:', error);
      }
    });

    // Listen for training_completed events
    this.eventSource.addEventListener('training_completed', (event) => {
      try {
        const eventData: SSETrainingEvent = {
          event: 'training_completed',
          data: JSON.parse(event.data)
        };
        this.handleSSEEvent(eventData);
      } catch (error) {
        console.error('Error parsing training_completed event:', error);
      }
    });

    // Listen for training_failed events
    this.eventSource.addEventListener('training_failed', (event) => {
      try {
        const eventData: SSETrainingEvent = {
          event: 'training_failed',
          data: JSON.parse(event.data)
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
    const callbackKey = `${event.data.agent_id}_${event.data.task_id}`;
    const callback = this.callbacks.get(callbackKey);
    
    if (callback) {
      callback(event);
    }

    // Log event for debugging
    console.log('Received SSE event:', event);
  }

  /**
   * Handle connection errors and implement reconnection logic
   */
  private handleConnectionError(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect SSE (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.callbacks.size > 0) {
          // Get the first callback to extract agentId and taskId for reconnection
          const [callbackKey] = Array.from(this.callbacks.keys());
          const [agentId, taskId] = callbackKey.split('_');
          const token = getAccessToken();
          
          if (token) {
            this.connect(agentId, taskId, token);
          }
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