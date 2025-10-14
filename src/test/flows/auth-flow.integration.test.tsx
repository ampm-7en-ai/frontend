import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders, mockApiSuccess, mockApiError } from '@/test/helpers/integration-helpers';

// Mock login page component for testing
const MockLoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Login successful
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div role="alert">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    
    mockApiSuccess('/api/auth/login', {
      user: { id: '123', email: 'test@example.com', name: 'Test User' },
      token: 'mock-jwt-token',
    });

    renderWithProviders(<MockLoginPage />);

    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });

  it('should show error message with invalid credentials', async () => {
    const user = userEvent.setup();
    
    mockApiError('/api/auth/login', 'Invalid email or password', 401);

    renderWithProviders(<MockLoginPage />);

    // Fill in login form with invalid credentials
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });

    // Should not redirect
    expect(window.location.href).not.toBe('/dashboard');
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    
    // Mock slow API response
    global.fetch = vi.fn(() => 
      new Promise<Response>((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: async () => ({ user: {}, token: 'token' }),
          } as Response);
        }, 100);
      })
    );

    renderWithProviders(<MockLoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Should show loading state
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /logging in/i })).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();
    
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    renderWithProviders(<MockLoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<MockLoginPage />);

    // Try to submit without filling fields
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Form should not submit (browser validation)
    expect(window.location.href).toBe('');
  });
});
