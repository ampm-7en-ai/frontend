import { toast } from '@/hooks/use-toast';

type TrainingStatus = 'started' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

interface TrainingUpdate {
  type: 'training_update';
  agentId: string;
  status: TrainingStatus;
  progress?: number;
  message?: string;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private messageHandlers: Set<(event: MessageEvent) => void> = new Set();

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://your-api-domain.com/ws';
    
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        // Notify all handlers
        this.messageHandlers.forEach(handler => handler(event));
        
        try {
          const data = JSON.parse(event.data) as TrainingUpdate;
          if (data.type === 'training_update') {
            this.handleTrainingUpdate(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  private handleTrainingUpdate(update: TrainingUpdate) {
    // Show different toasts based on training status
    switch (update.status) {
      case 'started':
        toast({
          title: "Training Started",
          description: update.message || "Agent training has started",
        });
        break;
        
      case 'in_progress':
        if (update.progress && update.progress % 25 === 0) { // Show progress at 25%, 50%, 75%
          toast({
            title: "Training Progress",
            description: `Training is ${update.progress}% complete`,
          });
        }
        break;
        
      case 'completed':
        toast({
          title: "Training Complete",
          description: update.message || "Agent training has completed successfully",
          variant: "default"
        });
        break;
        
      case 'failed':
        toast({
          title: "Training Failed",
          description: update.message || "There was an error during training",
          variant: "destructive"
        });
        break;
        
      case 'cancelled':
        toast({
          title: "Training Cancelled",
          description: "Agent training was cancelled",
          variant: "default"
        });
        break;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
      toast({
        title: "Connection Lost",
        description: "Failed to maintain connection to training service. Please refresh the page.",
        variant: "destructive"
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  addEventListener(handler: (event: MessageEvent) => void) {
    this.messageHandlers.add(handler);
  }

  removeEventListener(handler: (event: MessageEvent) => void) {
    this.messageHandlers.delete(handler);
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
