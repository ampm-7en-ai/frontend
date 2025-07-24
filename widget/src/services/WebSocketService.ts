
export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: any = {};
  private isConnectedState = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnectedState = true;
        this.reconnectAttempts = 0;
        this.handlers.onConnectionChange?.(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlers.onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnectedState = false;
        this.handlers.onConnectionChange?.(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handlers.onError?.('WebSocket connection error');
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.handlers.onError?.('Failed to create WebSocket connection');
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
      this.handlers.onError?.('Connection failed after multiple attempts');
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnectedState = false;
  }

  isConnected(): boolean {
    return this.isConnectedState;
  }

  on(handlers: {
    onMessage?: (data: any) => void;
    onError?: (error: string) => void;
    onConnectionChange?: (connected: boolean) => void;
  }) {
    this.handlers = handlers;
  }
}
