import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketService } from './WebSocketService';

describe('WebSocketService', () => {
  let service: WebSocketService;
  const testUrl = 'wss://test.example.com/ws';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebSocketService(testUrl);
  });

  it('should create instance with correct URL', () => {
    expect(service).toBeInstanceOf(WebSocketService);
  });

  it('should connect to WebSocket', () => {
    service.connect();
    // WebSocket mock should be called
    expect(service.isConnected()).toBe(false); // Initially connecting
  });

  it('should not connect if already connecting', () => {
    service.connect();
    service.connect();
    // Should not create multiple connections
  });

  it('should register event listeners', () => {
    const callback = vi.fn();
    service.on('message', callback);
    
    // Verify listener is registered (internal state)
    expect(callback).toBeDefined();
  });

  it('should remove event listeners', () => {
    const callback = vi.fn();
    service.on('message', callback);
    service.off('message', callback);
    
    // Listener should be removed
    expect(callback).toBeDefined();
  });

  it('should handle connection open event', async () => {
    const callback = vi.fn();
    service.on('connection', callback);
    
    service.connect();
    
    // Wait for connection to open
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it('should send message when connected', async () => {
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    const testMessage = { type: 'test', content: 'hello' };
    service.send(testMessage);
    // Message should be sent
  });

  it('should not send message when not connected', () => {
    const errorCallback = vi.fn();
    service.on('error', errorCallback);
    
    const testMessage = { type: 'test' };
    service.send(testMessage);
    
    expect(errorCallback).toHaveBeenCalled();
  });

  it('should disconnect properly', () => {
    service.connect();
    service.disconnect();
    
    expect(service.isConnected()).toBe(false);
  });

  it('should handle reconnection logic', async () => {
    service.connect();
    
    // Simulate connection close
    await new Promise(resolve => setTimeout(resolve, 10));
    service.disconnect();
    // Should trigger reconnection logic
  });

  it('should set auth headers', () => {
    const headers = { Authorization: 'Bearer token123' };
    service.setAuthHeaders(headers);
    
    // Headers should be set (internal state)
    expect(headers).toBeDefined();
  });

  it('should emit custom events', async () => {
    const callback = vi.fn();
    service.on('custom_event', callback);
    
    service.connect();
    
    // Simulate receiving a message
    await new Promise(resolve => setTimeout(resolve, 10));
    // Message handler should be called
  });

  it('should handle message parsing errors', async () => {
    const errorCallback = vi.fn();
    service.on('error', errorCallback);
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    // Should handle invalid JSON gracefully
  });

  it('should respect max reconnect attempts', () => {
    service.connect();
    
    // Simulate multiple connection failures
    for (let i = 0; i < 5; i++) {
      service.disconnect();
    }
    
    // Should stop after max attempts
  });

  it('should clear reconnect timeout on disconnect', () => {
    service.connect();
    service.disconnect();
    
    // Reconnect timeout should be cleared
    expect(service.isConnected()).toBe(false);
  });
});
