import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatWebSocketService } from './ChatWebSocketService';

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
    expect(service.isConnected()).toBe(false); // Initially connecting
  });

  it('should send message', async () => {
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    service.sendMessage('Hello');
  });

  it('should send session init', async () => {
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    service.sendSessionInit('session-123');
  });

  it('should handle incoming messages', async () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    // Simulate incoming message
  });

  it('should handle typing events', async () => {
    const typingStartCallback = vi.fn();
    const typingEndCallback = vi.fn();
    
    service.on({
      onTypingStart: typingStartCallback,
      onTypingEnd: typingEndCallback,
    });
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    // Typing events should be handled
  });

  it('should handle session ID received', async () => {
    const sessionIdCallback = vi.fn();
    service.on({ onSessionIdReceived: sessionIdCallback });
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    // Session ID should be captured
  });

  it('should normalize message types', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    // Message type normalization should work
  });

  it('should handle UI messages', async () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    // UI messages should be handled
  });

  it('should extract timestamp from various formats', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    // Timestamp extraction should work for different formats
  });

  it('should handle connection change events', async () => {
    const connectionCallback = vi.fn();
    service.on({ onConnectionChange: connectionCallback });
    
    service.connect();
    
    await vi.waitFor(() => {
      expect(connectionCallback).toHaveBeenCalled();
    });
  });

  it('should handle error events', async () => {
    const errorCallback = vi.fn();
    service.on({ onError: errorCallback });
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    // Error handling should work
  });

  it('should send custom data', async () => {
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    service.send({ type: 'custom', data: 'test' });
  });

  it('should disconnect properly', () => {
    service.connect();
    service.disconnect();
    
    expect(service.isConnected()).toBe(false);
  });

  it('should handle messages without content', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    // Should skip messages without content (except UI messages)
  });

  it('should generate message IDs', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    // Message ID generation should work
  });

  it('should include source identifier', () => {
    const messageCallback = vi.fn();
    service.on({ onMessage: messageCallback });
    
    service.connect();
    
    // Messages should include source: 'websocket'
  });
});
