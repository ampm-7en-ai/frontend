import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TestPageLayout } from './TestPageLayout';
import { renderWithProviders } from '@/test/helpers/integration-helpers';

// Mock the useAuth hook
vi.mock('@/context/AuthContext', async () => {
  const actual = await vi.importActual('@/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('TestPageLayout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while auth is loading', () => {
    const { useAuth } = require('@/context/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithProviders(<TestPageLayout />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    const { useAuth } = require('@/context/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(<TestPageLayout />);
    
    await waitFor(() => {
      // Check if Navigate component is rendered (would redirect)
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should render outlet when authenticated', () => {
    const { useAuth } = require('@/context/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '123', email: 'test@example.com' },
    });

    const { container } = renderWithProviders(<TestPageLayout />);
    
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('should handle auth state changes', async () => {
    const { useAuth } = require('@/context/AuthContext');
    
    // Start with loading
    const mockAuth = {
      isAuthenticated: false,
      isLoading: true,
    };
    useAuth.mockReturnValue(mockAuth);

    const { rerender } = renderWithProviders(<TestPageLayout />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then authenticated
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '123', email: 'test@example.com' },
    });

    rerender(<TestPageLayout />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
