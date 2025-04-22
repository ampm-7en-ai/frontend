interface WebSocketMessage {
  type: string;
  content?: string;
  timestamp?: string;
  [key: string]: any;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string) {}

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          this.emit(data.type, data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.handleReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.socket?.close();
    };
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect in ${timeout}ms...`);
      setTimeout(() => this.connect(), timeout);
    } else {
      this.emit('connection', { status: 'disconnected', error: 'Max reconnect attempts reached' });
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }
  
  off(event: string, callback: Function) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      callbacks.filter(cb => cb !== callback)
    );
  }

  send(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
      }
      
      try {
        this.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
        this.emit('error', 'Failed to send message');
      }
  }
  
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService('wss://api.7en.ai/ws');
