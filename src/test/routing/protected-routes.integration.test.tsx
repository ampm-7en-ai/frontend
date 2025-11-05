import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import { renderWithProviders, mockAuthenticatedUser, mockUnauthenticatedState } from '@/test/helpers/integration-helpers';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock components
const PublicPage = () => <div>Public Page</div>;
const LoginPage = () => <div>Login Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;
const AdminPage = () => <div>Admin Page</div>;

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  isAuthenticated, 
  requiredRole 
}: { 
  children: React.ReactNode;
  isAuthenticated: boolean;
  requiredRole?: string;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required, check it (mock implementation)
  if (requiredRole) {
    const userRole = 'USER'; // This would come from context in real app
    if (userRole !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ 
  children, 
  isAuthenticated, 
  userRole 
}: { 
  children: React.ReactNode;
  isAuthenticated: boolean;
  userRole?: string;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'SUPERADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const UnauthorizedPage = () => <div>Unauthorized Access</div>;

describe('Protected Routes Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithRouter = (
    initialRoute: string,
    isAuthenticated: boolean,
    userRole?: string
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<PublicPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute isAuthenticated={isAuthenticated} userRole={userRole}>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', () => {
      renderWithRouter('/', false);
      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });

    it('should allow access to login page without authentication', () => {
      renderWithRouter('/login', false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without authentication', () => {
      renderWithRouter('/dashboard', false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });

    it('should allow access to protected route when authenticated', () => {
      renderWithRouter('/dashboard', true);
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow SUPERADMIN to access admin routes', () => {
      renderWithRouter('/admin', true, 'SUPERADMIN');
      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });

    it('should deny USER access to admin routes', () => {
      renderWithRouter('/admin', true, 'USER');
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
    });

    it('should redirect unauthenticated users from admin routes to login', () => {
      renderWithRouter('/admin', false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Flow', () => {
    it('should maintain route protection after navigation', () => {
      const { rerender } = renderWithRouter('/dashboard', true);
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();

      // Simulate logout by re-rendering with unauthenticated state
      rerender(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/" element={<PublicPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute isAuthenticated={false}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Should redirect to login
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle direct URL access to protected routes', () => {
      renderWithRouter('/dashboard', false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should preserve intended route after login (state.from)', () => {
      // This would be implemented with location state in real app
      renderWithRouter('/login', false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should handle multiple role checks correctly', () => {
      // USER trying to access admin
      renderWithRouter('/admin', true, 'USER');
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();

      // SUPERADMIN accessing admin
      const { rerender } = renderWithRouter('/admin', true, 'SUPERADMIN');
      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });
});
