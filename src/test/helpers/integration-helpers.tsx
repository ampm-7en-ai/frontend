import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, expect } from 'vitest';

// Create a custom render function for integration tests
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Render with authenticated user
export function renderWithAuth(
  ui: ReactElement,
  user = createMockUser(),
  options?: RenderOptions
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const mockAuthContext = {
    isAuthenticated: true,
    isLoading: false,
    user,
    login: vi.fn(),
    logout: vi.fn(),
  };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
    mockAuthContext,
  };
}

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  ...overrides,
});

// Helper to create mock authenticated user with role
export const mockAuthenticatedUser = (role: 'USER' | 'SUPERADMIN' = 'USER') => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  role,
  createdAt: new Date().toISOString(),
});

// Helper to create mock unauthenticated state
export const mockUnauthenticatedState = () => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
});

// Helper to mock fetch responses
export const mockFetchResponse = (data: any, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as Response)
  );
};

// Helper to mock fetch error
export const mockFetchError = (error: string) => {
  global.fetch = vi.fn(() => Promise.reject(new Error(error)));
};

// Helper to mock API success
export const mockApiSuccess = (endpoint: string, data: any) => {
  global.fetch = vi.fn((url: string) => {
    if (url.includes(endpoint)) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
      } as Response);
    }
    return Promise.reject(new Error('Unhandled endpoint'));
  });
};

// Helper to mock API error
export const mockApiError = (endpoint: string, error: string, status = 400) => {
  global.fetch = vi.fn((url: string) => {
    if (url.includes(endpoint)) {
      return Promise.resolve({
        ok: false,
        status,
        json: async () => ({ error }),
        text: async () => JSON.stringify({ error }),
      } as Response);
    }
    return Promise.reject(new Error('Unhandled endpoint'));
  });
};

// Setup common API mocks
export const setupApiMocks = () => {
  global.fetch = vi.fn((url: string) => {
    // Mock agents endpoint
    if (url.includes('/agents')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ agents: [] }),
      } as Response);
    }
    
    // Mock conversations endpoint
    if (url.includes('/conversations')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ conversations: [] }),
      } as Response);
    }
    
    // Default fallback
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
  });
};

// Helper to wait for loading states
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/dom');
  await waitFor(() => {
    expect(document.querySelector('[data-loading]')).not.toBeInTheDocument();
  }, { timeout: 3000 });
};

// Helper to fill form fields
export const fillForm = async (fields: Record<string, string>) => {
  const { screen } = await import('@testing-library/dom');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(new RegExp(label, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
};

// Helper to submit form
export const submitForm = async (formName?: string) => {
  const { screen } = await import('@testing-library/dom');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  const submitButton = formName
    ? screen.getByRole('button', { name: new RegExp(formName, 'i') })
    : screen.getByRole('button', { name: /submit/i });

  await user.click(submitButton);
};

// Helper to click button by text
export const clickButton = async (buttonText: string) => {
  const { screen } = await import('@testing-library/dom');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
  await user.click(button);
};
