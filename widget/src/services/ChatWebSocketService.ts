
import { WebSocketService } from './WebSocketService';

export class ChatWebSocketService extends WebSocketService {
  private agentId: string;
  private context: string;
  private messageHandlers: any = {};

  constructor(agentId: string, context: string = "chat") {
    // Use the global API base URL if set, otherwise use default
    const apiBaseUrl = (window as any).CHAT_WIDGET_API_BASE_URL || 'https://api-staging.7en.ai';
    const wsBaseUrl = apiBaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    
    super(`${wsBaseUrl}/ws/${agentId}/${context}`);
    this.agentId = agentId;
    this.context = context;
  }

  on(handlers: {
    onMessage?: (message: any) => void;
    onTypingStart?: () => void;
    onTypingEnd?: () => void;
    onError?: (error: string) => void;
    onConnectionChange?: (connected: boolean) => void;
  }) {
    this.messageHandlers = handlers;
    
    super.on({
      onMessage: (data) => {
        try {
          // Handle different message types
          if (data.type === 'typing_start') {
            handlers.onTypingStart?.();
          } else if (data.type === 'typing_end') {
            handlers.onTypingEnd?.();
          } else if (data.type === 'system_message') {
            handlers.onMessage?.(data);
          } else if (data.type === 'bot_response' || data.type === 'ui') {
            handlers.onMessage?.(data);
          } else {
            // Handle other message types
            handlers.onMessage?.(data);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          handlers.onError?.('Error processing message');
        }
      },
      onError: (error) => {
        handlers.onError?.(error);
      },
      onConnectionChange: (connected) => {
        handlers.onConnectionChange?.(connected);
      }
    });
  }

  sendMessage(content: string) {
    const message = {
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    this.send(message);
  }

  getAgentId(): string {
    return this.agentId;
  }

  getContext(): string {
    return this.context;
  }
}
