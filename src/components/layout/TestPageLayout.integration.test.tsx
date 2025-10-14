import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TestPageLayout } from './TestPageLayout';
import { renderWithProviders } from '@/test/helpers/integration-helpers';

// Mock the useAuth hook
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from '@/context/AuthContext';

describe('TestPageLayout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation before each test
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('should show loading spinner while auth is loading', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithProviders(<TestPageLayout />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(<TestPageLayout />);
    
    // The Navigate component should redirect, so loading should not be present
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should render outlet when authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '123', email: 'test@example.com' },
    });

    const { container } = renderWithProviders(<TestPageLayout />);
    
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('should handle auth state changes', async () => {
    // Start with loading state
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { unmount } = renderWithProviders(<TestPageLayout />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Unmount and re-render with authenticated state
    unmount();

    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '123', email: 'test@example.com' },
    });

    renderWithProviders(<TestPageLayout />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Verify the main layout is rendered
    const mainDiv = document.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
  });
});
