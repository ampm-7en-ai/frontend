import { WS_BASE_URL } from '@/config/env';

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
  private processedMessages: Set<string> = new Set();
  private url: string;
  private authHeaders: Record<string, string> = {};

  constructor(url: string) {
    this.url = url;
  }

  // Add method to set auth headers
  setAuthHeaders(headers: Record<string, string>) {
    this.authHeaders = headers;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    console.log(`WebSocketService: Connecting to ${this.url}`);
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };
    
    this.socket.onmessage = (event) => {
      console.log('WebSocket raw message received:', event.data);
      
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket parsed message:', data);
        
        // Generate a message ID for deduplication
        const messageId = data.id || 
                         `${data.type}-${JSON.stringify(data.data || {})}-${new Date().getTime()}`;
        
        // Skip duplicate processing within a short time window
        if (this.processedMessages.has(messageId)) {
          console.log('Skipping duplicate WebSocket message:', messageId);
          return;
        }
        
        // Add to processed messages
        this.processedMessages.add(messageId);
        
        // Clean up old entries periodically
        if (this.processedMessages.size > 100) {
          this.processedMessages = new Set(
            Array.from(this.processedMessages).slice(-50)
          );
        }
        
        if (data.type) {
          // Emit the specific event type
          this.emit(data.type, data);
          
          // Also emit a generic 'message' event for all messages
          this.emit('message', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.emit('connection', { status: 'disconnected' });
      this.handleReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', 'Connection error');
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

  send(message: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
      
    try {
      console.log('WebSocket sending message:', message);
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
    console.log(`WebSocketService emitting '${event}' event:`, data);
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
  
  disconnect() {
    if (this.socket) {
      console.log('WebSocketService: Disconnecting');
      this.socket.close();
      this.socket = null;
    }
  }
}
