import { getAccessToken } from '@/utils/api-config';
import { SSE } from 'sse.js';

export interface SSETrainingEvent {
  event: 'training_connected' | 'training_progress' | 'training_completed' | 'training_failed';
  data: {
    agent_id: string;
    task_id: string;
    agent_name?: string;
    status: 'training' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    error?: string;
    timestamp: string;
  };
}

export interface SSEEventLog {
  id: string;
  event: SSETrainingEvent;
  timestamp: Date;
  agentId: string;
}

export type SSEEventCallback = (event: SSETrainingEvent) => void;

class TrainingSSEService {
  private eventSource: any;
  private callbacks: Map<string, SSEEventCallback> = new Map();
  private taskMappings: Map<string, string> = new Map();
  private eventLogs: SSEEventLog[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectionStatusCallbacks: Set<(status: 'connecting' | 'open' | 'closed') => void> = new Set();

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
   * Subscribe to connection status changes
   */
  subscribeToConnectionStatus(callback: (status: 'connecting' | 'open' | 'closed') => void): void {
    this.connectionStatusCallbacks.add(callback);
  }

  /**
   * Unsubscribe from connection status changes
   */
  unsubscribeFromConnectionStatus(callback: (status: 'connecting' | 'open' | 'closed') => void): void {
    this.connectionStatusCallbacks.delete(callback);
  }

  /**
   * Get recent event logs
   */
  getRecentEventLogs(agentId?: string, limit: number = 50): SSEEventLog[] {
    let logs = this.eventLogs;
    
    if (agentId) {
      logs = logs.filter(log => log.agentId === agentId);
    }
    
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear event logs
   */
  clearEventLogs(agentId?: string): void {
    if (agentId) {
      this.eventLogs = this.eventLogs.filter(log => log.agentId !== agentId);
    } else {
      this.eventLogs = [];
    }
  }

  /**
   * Create SSE connection
   */
  private async connect(agentId: string, token: string): Promise<void> {
    try {
      // Close existing connection
      this.disconnect();

      // Notify connection status change
      this.notifyConnectionStatus('connecting');

      // Backend endpoint: /api/ai/train-status-sse/{agentId}/
      const sseUrl = `https://api-staging.7en.ai/api/ai/train-status-sse/${agentId}/`;
      
      this.eventSource = new SSE(sseUrl, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Authorization': `Bearer ${token}`
        },
        method: 'POST'
      });

      // Handle incoming messages (for generic message events)
      this.eventSource.onmessage = (event) => {
        try {
          console.log("SSE event", event);
          const data = JSON.parse(event.data);
          console.log('Generic SSE message:', data);
        } catch (error) {
          console.error('Error parsing SSE event data:', error);
        }
      };

      // Handle connection open
      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened:', event);
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus('open');
      };

      // Handle connection errors
      this.eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        this.notifyConnectionStatus('closed');
        this.handleConnectionError(agentId, token);
      };

      // Setup backend-specific event listeners
      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.notifyConnectionStatus('closed');
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
        
        const eventData: SSETrainingEvent = {
          event: 'training_connected',
          data: {
            ...data,
            task_id: this.taskMappings.get(data.agent_id) || 'unknown',
            status: 'training' as const
          }
        };
        this.handleSSEEvent(eventData);
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
            status: 'training' as const
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
            status: 'completed' as const
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
            status: 'failed' as const
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
    // Add to event log
    const logEntry: SSEEventLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: new Date(),
      agentId: event.data.agent_id
    };
    
    this.eventLogs.push(logEntry);
    
    // Keep only recent logs (last 100)
    if (this.eventLogs.length > 100) {
      this.eventLogs = this.eventLogs.slice(-100);
    }

    // Notify callback
    const callback = this.callbacks.get(event.data.agent_id);
    if (callback) {
      callback(event);
    }

    // Log event for debugging
    console.log('Received SSE event:', event);
  }

  /**
   * Notify connection status callbacks
   */
  private notifyConnectionStatus(status: 'connecting' | 'open' | 'closed'): void {
    this.connectionStatusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
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
    this.notifyConnectionStatus('closed');
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
