import { string } from 'zod';
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
  source?: string;
  session_id?: string;
  messageId?: string;
}

interface ChatWebSocketEvents {
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: boolean) => void;
  onSessionIdReceived?: (sessionId: string) => void;
}

export class ChatWebSocketService {
  protected ws: WebSocketService;
  private events: ChatWebSocketEvents = {};
  private sessionIdReceived: boolean = false;
  
  constructor(agentId: string, url: string) {
    this.ws = new WebSocketService(url === "playground" ? 
      `${WS_BASE_URL}chat-playground/${agentId}/` : 
      `${WS_BASE_URL}chat/${agentId}/`);
    
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
    this.ws.on('connection', (data) => this.events.onConnectionChange?.(data.status === 'connected'));
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
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  // Send session initialization message
  sendSessionInit(sessionId: string) {
    console.log('📤 Sending session_init with sessionId:', sessionId);
    this.ws.send({
      type: "session_init",
      session_id: sessionId
    });
  }
  
  send(data: any) {
    this.ws.send(data);
  }
  
  on(events: ChatWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    console.log('📨 Raw WebSocket message received:', data);

    // Helper to normalize message types between DB and realtime
    const mapType = (type?: string, sender?: string) => {
      const t = (type || '').toLowerCase();
      const s = (sender || '').toLowerCase();
      if (t === 'ui') return 'ui';
      if (t === 'message' || t === 'user' || s === 'user') return 'user';
      if (t === 'assistant' || t === 'bot' || t === 'bot_response' || s === 'agent' || s === 'assistant') return 'bot_response';
      if (t === 'system' || t === 'system_message') return 'system_message';
      return t || 'bot_response';
    };
    
    // Check for session_id in ANY message type
    if (data.session_id && !this.sessionIdReceived && this.events.onSessionIdReceived) {
      console.log('🆔 Session ID found in message:', data.session_id, 'Message type:', data.type);
      this.sessionIdReceived = true;
      this.events.onSessionIdReceived(data.session_id);
    }

    const normalizedType = mapType(data.type, data.sender);
    
    // Handle UI messages (like email prompt) that don't have content
    if (normalizedType === 'ui' && data.ui_type) {
      const messageTimestamp = this.extractTimestamp(data);
      const messageId = `${normalizedType}-${data.ui_type}-${messageTimestamp}`;
      
      this.events.onMessage?.({
        type: 'ui',
        content: '',
        timestamp: messageTimestamp,
        model: '',
        temperature: 0,
        prompt: '',
        ui_type: data.ui_type,
        source: data.source || 'websocket',
        session_id: data.session_id,
        messageId: data.messageId || data.id || messageId
      });
      
      return;
    }
    
    // Extract message content
    const messageContent = data.content || '';
    const messageTimestamp = this.extractTimestamp(data);
    
    const messageModel = data.model || data.config?.response_model || data.response_model || '';
    const messagePrompt = data.prompt || data.system_prompt || '';
    const messageTemperature = data.temperature !== undefined ? Number(data.temperature) : 
                              data.config?.temperature !== undefined ? Number(data.config.temperature) : 0;
    
    // Skip if not a valid message (except for UI messages)
    if (!messageContent && normalizedType !== 'ui') {
      console.log('⏭️ Skipping message without content');
      return;
    }
    
    // Generate message ID from existing data or create one
    const messageId = data.messageId || data.id || `${(messageContent as string).slice(0, 20)}-${messageTimestamp}`;
    
    // Emit the message event (deduplication handled by component)
    this.events.onMessage?.({
      type: normalizedType,
      content: messageContent,
      timestamp: messageTimestamp,
      model: messageModel,
      temperature: messageTemperature,
      prompt: messagePrompt,
      source: data.source || 'websocket',
      session_id: data.session_id,
      messageId
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
    
    for (const ts of possibleTimestamps) {
      if (ts) {
        try {
          const date = new Date(ts);
          if (!isNaN(date.getTime())) {
            return ts;
          }
        } catch (error) {
          console.log('❌ Invalid timestamp format:', ts);
        }
      }
    }
    
    const fallbackTimestamp = new Date().toISOString();
    return fallbackTimestamp;
  }
}
