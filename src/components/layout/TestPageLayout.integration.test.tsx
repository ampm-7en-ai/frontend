import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TestPageLayout } from './TestPageLayout';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useAuth hook
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from '@/context/AuthContext';

// Helper to render with proper routing
const renderWithRouting = (initialRoute = '/test') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/test" element={<TestPageLayout />}>
            <Route index element={<div>Test Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

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

    renderWithRouting();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouting();
    
    // Should navigate to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should render outlet when authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '123', email: 'test@example.com' },
    });

    renderWithRouting();
    
    // Should render the outlet content
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should handle auth state changes', async () => {
    // Start with loading state
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { unmount } = renderWithRouting();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Unmount and re-render with authenticated state
    unmount();

    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '123', email: 'test@example.com' },
    });

    renderWithRouting();

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});
