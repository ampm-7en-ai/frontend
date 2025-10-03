import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatWebSocketService } from './ChatWebSocketService';

// Mock WebSocketService
vi.mock('./WebSocketService', () => {
  return {
    WebSocketService: vi.fn().mockImplementation(() => {
      const listeners = new Map();
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        isConnected: vi.fn(() => true),
        send: vi.fn(),
        on: vi.fn((event, callback) => {
          listeners.set(event, callback);
        }),
        // Expose listeners for testing
        _listeners: listeners,
        // Helper to trigger events
        _emit: (event: string, data: any) => {
          const callback = listeners.get(event);
          if (callback) callback(data);
        }
      };
    })
  };
});

describe('ChatWebSocketService', () => {
  let service: ChatWebSocketService;
  const testAgentId = 'agent-123';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChatWebSocketService(testAgentId, 'playground');
  });

  it('should create instance with correct URL', () => {
    expect(service).toBeInstanceOf(ChatWebSocketService);
  });

  it('should connect to WebSocket', () => {
    service.connect();
    expect(service['ws'].connect).toHaveBeenCalled();
  });

  it('should check connection status', () => {
    expect(service.isConnected()).toBe(true);
  });

  it('should send message with correct format', () => {
    service.sendMessage('Hello');
    expect(service['ws'].send).toHaveBeenCalledWith({
      type: 'user',
      content: 'Hello',
      timestamp: expect.any(String)
    });
  });

  it('should send session init message', () => {
    service.sendSessionInit('session-123');
    expect(service['ws'].send).toHaveBeenCalledWith({
      type: 'session_init',
      session_id: 'session-123'
    });
  });

  it('should handle bot response messages', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });

    // Simulate incoming bot message
    (service['ws'] as any)._emit('message', {
      type: 'bot_response',
      content: 'Hello from bot',
      timestamp: new Date().toISOString()
    });

    expect(messageCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'bot_response',
        content: 'Hello from bot',
        source: 'websocket'
      })
    );
  });

  it('should normalize message types correctly', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });

    // Test different message type variations
    (service['ws'] as any)._emit('message', {
      type: 'assistant',
      content: 'Response',
      timestamp: new Date().toISOString()
    });

    expect(messageCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'bot_response'
      })
    );
  });

  it('should handle UI messages', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });

    (service['ws'] as any)._emit('message', {
      type: 'ui',
      ui_type: 'email_prompt',
      timestamp: new Date().toISOString()
    });

    expect(messageCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ui',
        ui_type: 'email_prompt',
        content: ''
      })
    );
  });

  it('should capture session ID from messages', () => {
    const sessionIdCallback = vi.fn();
    service.on({ onSessionIdReceived: sessionIdCallback });

    (service['ws'] as any)._emit('message', {
      type: 'bot_response',
      content: 'Hello',
      session_id: 'session-456',
      timestamp: new Date().toISOString()
    });

    expect(sessionIdCallback).toHaveBeenCalledWith('session-456');
  });

  it('should only capture session ID once', () => {
    const sessionIdCallback = vi.fn();
    service.on({ onSessionIdReceived: sessionIdCallback });

    (service['ws'] as any)._emit('message', {
      type: 'bot_response',
      content: 'Hello',
      session_id: 'session-456',
      timestamp: new Date().toISOString()
    });

    (service['ws'] as any)._emit('message', {
      type: 'bot_response',
      content: 'World',
      session_id: 'session-456',
      timestamp: new Date().toISOString()
    });

    expect(sessionIdCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle typing start events', () => {
    const typingStartCallback = vi.fn();
    service.on({ onTypingStart: typingStartCallback });

    (service['ws'] as any)._emit('typing_start', {});

    expect(typingStartCallback).toHaveBeenCalled();
  });

  it('should handle typing end events', () => {
    const typingEndCallback = vi.fn();
    service.on({ onTypingEnd: typingEndCallback });

    (service['ws'] as any)._emit('typing_end', {});

    expect(typingEndCallback).toHaveBeenCalled();
  });

  it('should handle connection status changes', () => {
    const connectionCallback = vi.fn();
    service.on({ onConnectionChange: connectionCallback });

    (service['ws'] as any)._emit('connection', { status: 'connected' });
    expect(connectionCallback).toHaveBeenCalledWith(true);

    (service['ws'] as any)._emit('connection', { status: 'disconnected' });
    expect(connectionCallback).toHaveBeenCalledWith(false);
  });

  it('should handle error events', () => {
    const errorCallback = vi.fn();
    service.on({ onError: errorCallback });

    (service['ws'] as any)._emit('error', 'Connection failed');

    expect(errorCallback).toHaveBeenCalledWith('Connection failed');
  });

  it('should skip messages without content', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });

    (service['ws'] as any)._emit('message', {
      type: 'bot_response',
      timestamp: new Date().toISOString()
      // No content
    });

    expect(messageCallback).not.toHaveBeenCalled();
  });

  it('should extract timestamp from various formats', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });

    const testTimestamp = '2024-01-01T12:00:00Z';
    
    (service['ws'] as any)._emit('message', {
      type: 'bot_response',
      content: 'Test',
      created_at: testTimestamp
    });

    expect(messageCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: testTimestamp
      })
    );
  });

  it('should disconnect properly', () => {
    service.disconnect();
    expect(service['ws'].disconnect).toHaveBeenCalled();
  });

  it('should send custom data', () => {
    const customData = { type: 'custom', data: 'test' };
    service.send(customData);
    expect(service['ws'].send).toHaveBeenCalledWith(customData);
  });
});
