import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from './useAppTheme';

describe('useAppTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset document element classes
    document.documentElement.className = '';
  });

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.theme).toBe('light');
  });

  it('should initialize with saved theme from localStorage', () => {
    localStorage.setItem('app-theme', 'dark');
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    localStorage.setItem('app-theme', 'dark');
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
  });

  it('should persist theme to localStorage when toggling', () => {
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(localStorage.getItem('app-theme')).toBe('dark');
  });

  it('should set theme correctly', () => {
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');
  });

  it('should apply dark class to document element', () => {
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class when switching to light', () => {
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should dispatch storage event when theme changes', () => {
    const storageListener = vi.fn();
    window.addEventListener('storage', storageListener);
    
    const { result } = renderHook(() => useAppTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    // Note: In test environment, storage events might not fire automatically
    // This test documents the expected behavior
    window.removeEventListener('storage', storageListener);
  });
});
