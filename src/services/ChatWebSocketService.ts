
import { WebSocketService } from './WebSocketService';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface ChatWebSocketEvents {
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
}

export class ChatWebSocketService {
  private ws: WebSocketService;
  private events: ChatWebSocketEvents = {};
  
  constructor(agentId: string) {
    this.ws = new WebSocketService(`wss://api.7en.ai/ws/chat/${agentId}/`);
    
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
  }
  
  connect() {
    this.ws.connect();
  }
  
  disconnect() {
    this.ws.disconnect();
  }
  
  sendMessage(content: string) {
    this.ws.send({
      type: 'message',
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  on(events: ChatWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    if (data.type === 'bot_response') {
      this.events.onMessage?.({
        type: 'bot',
        content: data.content,
        timestamp: data.timestamp
      });
    }
  }
}
