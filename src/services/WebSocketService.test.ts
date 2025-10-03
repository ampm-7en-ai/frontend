import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WebSocketService } from './WebSocketService';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: code || 1000, reason: reason || '', wasClean: true });
  }

  // Helper method for testing
  simulateMessage(data: any) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }
}

describe('WebSocketService', () => {
  let service: WebSocketService;
  const testUrl = 'ws://localhost:8080/test';

  beforeEach(() => {
    // @ts-ignore
    global.WebSocket = MockWebSocket;
    vi.clearAllMocks();
    service = new WebSocketService(testUrl);
  });

  afterEach(() => {
    service.disconnect();
    vi.clearAllTimers();
  });

  it('should create instance with correct URL', () => {
    expect(service).toBeInstanceOf(WebSocketService);
  });

  it('should connect to WebSocket', async () => {
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(service.isConnected()).toBe(true);
  });

  it('should handle connection open event', async () => {
    const connectionCallback = vi.fn();
    service.on('connection', connectionCallback);
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(connectionCallback).toHaveBeenCalledWith({ status: 'connected' });
  });

  it('should send message when connected', async () => {
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const testMessage = { type: 'test', content: 'hello' };
    
    expect(() => service.send(testMessage)).not.toThrow();
  });

  it('should not send message when disconnected', () => {
    const errorCallback = vi.fn();
    service.on('error', errorCallback);
    
    service.send({ type: 'test' });
    
    expect(errorCallback).toHaveBeenCalledWith('WebSocket not connected');
  });

  it('should receive and parse messages', async () => {
    const messageCallback = vi.fn();
    service.on('message', messageCallback);
    
    service.connect();
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Simulate incoming message
    const mockWs = (service as any).socket as MockWebSocket;
    const testMessage = { type: 'test_message', content: 'Hello' };
    mockWs.simulateMessage(testMessage);
    
    expect(messageCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'test_message',
        content: 'Hello',
        source: 'websocket'
      })
    );
  });

  it('should emit message with source identifier', async () => {
    const messageCallback = vi.fn();
    service.on('message', messageCallback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.simulateMessage({ type: 'test', data: 'value' });
    
    expect(messageCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'websocket'
      })
    );
  });

  it('should emit specific event type', async () => {
    const specificCallback = vi.fn();
    service.on('custom_event', specificCallback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.simulateMessage({ type: 'custom_event', data: 'test' });
    
    expect(specificCallback).toHaveBeenCalled();
  });

  it('should handle multiple event listeners', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    service.on('test_event', callback1);
    service.on('test_event', callback2);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.simulateMessage({ type: 'test_event' });
    
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('should remove event listeners', async () => {
    const callback = vi.fn();
    
    service.on('test_event', callback);
    service.off('test_event', callback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.simulateMessage({ type: 'test_event' });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle connection errors', async () => {
    const errorCallback = vi.fn();
    service.on('error', errorCallback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.simulateError();
    
    expect(errorCallback).toHaveBeenCalledWith('Connection error');
  });

  it('should handle disconnection', async () => {
    const connectionCallback = vi.fn();
    service.on('connection', connectionCallback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    service.disconnect();
    
    expect(service.isConnected()).toBe(false);
  });

  it('should handle unexpected close with reconnection', async () => {
    vi.useFakeTimers();
    
    service.connect();
    await vi.advanceTimersByTimeAsync(20);
    
    // Simulate unexpected close
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.close(1006, 'Abnormal closure');
    
    // Should schedule reconnect
    expect((service as any).reconnectAttempts).toBeGreaterThan(0);
    
    vi.useRealTimers();
  });

  it('should not reconnect on normal close', async () => {
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.close(1000, 'Normal closure');
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect((service as any).reconnectAttempts).toBe(0);
  });

  it('should handle malformed JSON messages gracefully', async () => {
    const messageCallback = vi.fn();
    service.on('message', messageCallback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.onmessage?.({ data: 'invalid json{' });
    
    // Should not crash, message callback should not be called
    expect(messageCallback).not.toHaveBeenCalled();
  });

  it('should prevent multiple simultaneous connections', async () => {
    service.connect();
    service.connect(); // Second call should be ignored
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(service.isConnected()).toBe(true);
  });

  it('should set auth headers', () => {
    const headers = { Authorization: 'Bearer token123' };
    
    expect(() => service.setAuthHeaders(headers)).not.toThrow();
  });

  it('should clear reconnect timeout on disconnect', async () => {
    vi.useFakeTimers();
    
    service.connect();
    await vi.advanceTimersByTimeAsync(20);
    
    // Trigger reconnect
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.close(1006);
    
    // Disconnect before reconnect happens
    service.disconnect();
    
    expect((service as any).reconnectTimeout).toBeNull();
    expect((service as any).reconnectAttempts).toBe(0);
    
    vi.useRealTimers();
  });

  it('should respect max reconnect attempts', async () => {
    vi.useFakeTimers();
    
    service.connect();
    await vi.advanceTimersByTimeAsync(20);
    
    const mockWs = (service as any).socket as MockWebSocket;
    
    // Trigger multiple reconnect attempts
    for (let i = 0; i < 5; i++) {
      mockWs.close(1006);
      await vi.advanceTimersByTimeAsync(20000);
    }
    
    // Should stop after max attempts (3)
    expect((service as any).reconnectAttempts).toBeLessThanOrEqual(3);
    
    vi.useRealTimers();
  });

  it('should handle send error gracefully', async () => {
    const errorCallback = vi.fn();
    service.on('error', errorCallback);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Force socket to closed state
    (service as any).socket.readyState = MockWebSocket.CLOSED;
    
    service.send({ type: 'test' });
    
    expect(errorCallback).toHaveBeenCalledWith('WebSocket not connected');
  });

  it('should emit events to all listeners without errors', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn(() => { throw new Error('Callback error'); });
    const callback3 = vi.fn();
    
    service.on('test', callback1);
    service.on('test', callback2);
    service.on('test', callback3);
    
    service.connect();
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const mockWs = (service as any).socket as MockWebSocket;
    mockWs.simulateMessage({ type: 'test' });
    
    // All callbacks should be called even if one throws
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
    expect(callback3).toHaveBeenCalled();
  });
});
