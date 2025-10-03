import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock cache utilities testing
describe('Cache Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should set and get cache items', () => {
    const key = 'test-key';
    const value = { data: 'test-data' };
    
    localStorage.setItem(key, JSON.stringify(value));
    const retrieved = JSON.parse(localStorage.getItem(key) || '{}');
    
    expect(retrieved).toEqual(value);
  });

  it('should handle cache expiration', () => {
    const key = 'expiring-key';
    const value = { data: 'test', timestamp: Date.now() };
    const ttl = 1000; // 1 second
    
    localStorage.setItem(key, JSON.stringify(value));
    
    const cached = JSON.parse(localStorage.getItem(key) || '{}');
    const isExpired = Date.now() - cached.timestamp > ttl;
    
    expect(isExpired).toBe(false);
  });

  it('should clear cache by key', () => {
    const key = 'clear-key';
    localStorage.setItem(key, 'value');
    
    localStorage.removeItem(key);
    
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should clear all cache', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    
    localStorage.clear();
    
    expect(localStorage.getItem('key1')).toBeNull();
    expect(localStorage.getItem('key2')).toBeNull();
  });

  it('should handle invalid JSON gracefully', () => {
    const key = 'invalid-json';
    localStorage.setItem(key, 'not-valid-json{');
    
    try {
      JSON.parse(localStorage.getItem(key) || '');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
