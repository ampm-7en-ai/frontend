
import { WebSocketService } from './WebSocketService';
import { WS_BASE_URL } from '@/config/env';

interface ChatMessage {
  content: string;
  timestamp: string;
  type: string;
  model: string;
  prompt: string;
  temperature: number;
  ui_type?: string;
}

interface ChatWebSocketEvents {
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: boolean) => void;
}

export class ChatWebSocketService {
  protected ws: WebSocketService;
  private events: ChatWebSocketEvents = {};
  private processedMessageIds: Set<string> = new Set();
  private visitorId?: string;
  private sessionId?: string;
  private shouldRestore: boolean = false;
  private onSessionUpdate?: (messages: any[]) => void;
  private hasInitialized: boolean = false;
  
  constructor(
    agentId: string, 
    url: string, 
    visitorId?: string, 
    sessionId?: string,
    shouldRestore: boolean = false,
    onSessionUpdate?: (messages: any[]) => void
  ) {
    this.visitorId = visitorId;
    this.sessionId = sessionId;
    this.shouldRestore = shouldRestore;
    this.onSessionUpdate = onSessionUpdate;
    
    // Updated URL format using WS_BASE_URL from environment
    this.ws = new WebSocketService(url === "playground" ? 
      `${WS_BASE_URL}chat-playground/${agentId}/` : 
      `${WS_BASE_URL}chat/${agentId}/`);
    
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
    this.ws.on('connection', (data) => {
      const isConnected = data.status === 'connected';
      this.events.onConnectionChange?.(isConnected);
      
      // Send init message with session data when connected (only for preview with session)
      if (isConnected && this.visitorId && this.sessionId && !this.hasInitialized) {
        this.sendInitMessage();
        this.hasInitialized = true;
      }
    });
  }
  
  private sendInitMessage() {
    if (this.visitorId && this.sessionId) {
      console.log('Sending init message with session data:', {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        shouldRestore: this.shouldRestore
      });
      
      this.ws.send({
        type: 'init',
        session_id: this.sessionId,
        visitor_id: this.visitorId,
        source: 'website_embed',
        restore: this.shouldRestore
      });
    }
  }
  
  connect() {
    this.ws.connect();
  }
  
  disconnect() {
    this.ws.disconnect();
  }
  
  isConnected(): boolean {
    return this.ws.isConnected();
  }
  
  sendMessage(content: string) {
    this.ws.send({
      type: 'message',
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  send(data: any) {
    this.ws.send(data);
  }
  
  on(events: ChatWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    console.log('=== RAW WebSocket Message ===');
    console.log('Full data:', JSON.stringify(data, null, 2));
    console.log('Data type:', data.type);
    
    // Handle session restoration messages
    if (data.type === 'session_restored' && data.messages) {
      console.log('=== Session Restoration ===');
      console.log('Restored messages:', data.messages);
      
      // Process each restored message
      data.messages.forEach((msg: any, index: number) => {
        // Add slight delay to maintain order
        setTimeout(() => {
          this.events.onMessage?.({
            type: msg.sender === 'user' ? 'user_message' : 'bot_response',
            content: msg.content || '',
            timestamp: msg.timestamp || new Date().toISOString(),
            model: '',
            temperature: 0,
            prompt: '',
            ui_type: msg.ui_type
          });
        }, index * 50);
      });
      
      return;
    }
    
    // Handle UI messages (like yes_no) that don't have content
    if (data.type === 'ui' && data.ui_type) {
      const messageTimestamp = this.extractTimestamp(data);
      const messageId = `${data.type}-${data.ui_type}-${messageTimestamp}`;
      
      console.log('=== UI Message Processing ===');
      console.log('UI message timestamp:', messageTimestamp);
      
      if (this.processedMessageIds.has(messageId)) {
        console.log('Skipping duplicate UI message:', messageId);
        return;
      }
      
      this.processedMessageIds.add(messageId);
      
      this.events.onMessage?.({
        type: data.type,
        content: '',
        timestamp: messageTimestamp,
        model: '',
        temperature: 0,
        prompt: '',
        ui_type: data.ui_type
      });
      
      return;
    }
    
    // Extract message content based on the response format
    const messageContent = data.content || '';
    const messageType = data.type || 'bot_response';
    const messageTimestamp = this.extractTimestamp(data);
    
    console.log('=== Regular Message Processing ===');
    console.log('Message type:', messageType);
    console.log('Message content:', messageContent);
    console.log('Extracted timestamp:', messageTimestamp);
    
    const messageModel = data.model || data.config?.response_model || data.response_model || '';
    const messagePrompt = data.prompt || data.system_prompt || '';
    const messageTemperature = data.temperature !== undefined ? Number(data.temperature) : 
                              data.config?.temperature !== undefined ? Number(data.config.temperature) : 0;
    
    // Skip if not a valid message (except for UI messages which we handled above)
    if (!messageContent && data.type !== 'ui') {
      console.log('Skipping message without content');
      return;
    }
    
    // Generate a consistent ID for deduplication
    const messageId = `${messageContent}-${messageTimestamp}`;
    
    if (this.processedMessageIds.has(messageId)) {
      console.log('Skipping duplicate message:', messageId);
      return;
    }
    
    this.processedMessageIds.add(messageId);
    
    // Limit the size of the set to prevent memory issues
    if (this.processedMessageIds.size > 100) {
      this.processedMessageIds = new Set(
        Array.from(this.processedMessageIds).slice(-50)
      );
    }
    
    console.log('=== Final Message Data ===');
    console.log('Final timestamp being sent:', messageTimestamp);
    console.log('Message model:', messageModel);
    console.log('Message temperature:', messageTemperature);
    
    this.events.onMessage?.({
      type: messageType,
      content: messageContent,
      timestamp: messageTimestamp,
      model: messageModel,
      temperature: messageTemperature,
      prompt: messagePrompt
    });
  }
  
  private extractTimestamp(data: any): string {
    const possibleTimestamps = [
      data.timestamp,
      data.created_at,
      data.time,
      data.datetime,
      data.sent_at,
      data.message?.timestamp,
      data.response?.timestamp,
      data.message?.created_at,
      data.response?.created_at
    ];
    
    console.log('=== Timestamp Extraction ===');
    console.log('Checking timestamps:', possibleTimestamps);
    
    for (const ts of possibleTimestamps) {
      if (ts) {
        try {
          const date = new Date(ts);
          if (!isNaN(date.getTime())) {
            console.log('Valid timestamp found:', ts);
            return ts;
          }
        } catch (error) {
          console.log('Invalid timestamp format:', ts);
        }
      }
    }
    
    const fallbackTimestamp = new Date().toISOString();
    console.log('Using fallback timestamp:', fallbackTimestamp);
    return fallbackTimestamp;
  }
}
