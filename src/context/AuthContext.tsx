import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl, getAuthHeaders, isUserVerified } from '@/utils/api-config';

// Define user role types
export type UserRole = 'user' | 'admin' | 'superadmin';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  businessId?: string;  // Only for admin users
  accessToken?: string;
  refreshToken?: string;
  isVerified?: boolean;  // Added verification status
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, authData?: AuthData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  needsVerification: boolean;
  setNeedsVerification: (value: boolean) => void;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  getToken: () => string | null;
}

interface AuthData {
  accessToken: string;
  refreshToken: string | null;
  userId: number;
  role: UserRole;
  isVerified?: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get token
  const getToken = (): string | null => {
    return user?.accessToken || null;
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if accessToken exists
          if (parsedUser.accessToken) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Set verification state from stored user data
            const userNeedsVerification = parsedUser.isVerified === false;
            setNeedsVerification(userNeedsVerification);
            
            if (userNeedsVerification) {
              if (parsedUser.email) {
                setPendingVerificationEmail(parsedUser.email);
              }
              
              // Only redirect to verify if not already there and not a protected route
              if (location.pathname !== '/verify' && 
                  location.pathname !== '/login') {
                navigate('/verify');
              }
            } 
            // If user is verified and on login or verify page, redirect to dashboard
            else if (location.pathname === '/login' || location.pathname === '/verify') {
              // Redirect based on role
              const dashboardPath = parsedUser.role === 'superadmin' ? 
                '/dashboard/superadmin' : 
                (parsedUser.role === 'admin' ? '/dashboard/admin' : '/dashboard');
              navigate(dashboardPath);
            }
          } else {
            // Token is missing, clear storage and redirect to login
            localStorage.removeItem('user');
            if (location.pathname !== '/login' && location.pathname !== '/verify') {
              navigate('/login');
            }
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem('user');
          if (location.pathname !== '/login' && location.pathname !== '/verify') {
            navigate('/login');
          }
        }
      } else if (location.pathname !== '/login' && location.pathname !== '/verify') {
        // No stored user data and not on login or verify page, redirect to login
        navigate('/login');
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (username: string, password: string, authData?: AuthData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If authData is provided, we use it (API response)
      if (authData) {
        const isVerified = authData.isVerified !== false; // Default to true if not explicitly false
        
        const userData = {
          id: authData.userId.toString(),
          name: username,
          email: `${username}@example.com`, // This would come from the API in a real app
          role: authData.role,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          avatar: `https://ui-avatars.com/api/?name=${username}&background=0D8ABC&color=fff`,
          ...(authData.role === 'admin' ? { businessId: 'b1' } : {}),
          isVerified: isVerified
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Always check verification before allowing access to dashboard
        if (!isVerified) {
          setNeedsVerification(true);
          setPendingVerificationEmail(`${username}@example.com`);
          navigate('/verify');
        }
        return;
      }
      
      // Legacy simulation code (fallback for development)
      if (username === 'superadmin' && password === '123456') {
        const superAdminUser = {
          id: '1',
          name: 'Super Admin',
          email: 'superadmin@example.com',
          role: 'superadmin' as UserRole,
          avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff',
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
          isVerified: true
        };
        setUser(superAdminUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(superAdminUser));
        navigate('/dashboard/superadmin');
      } else if (username === 'admin' && password === '123456') {
        const adminUser = {
          id: '2',
          name: 'Business Admin',
          email: 'admin@example.com',
          role: 'admin' as UserRole,
          businessId: 'b1',
          avatar: 'https://ui-avatars.com/api/?name=Business+Admin&background=0D8ABC&color=fff',
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
          isVerified: true
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(adminUser));
        navigate('/dashboard/admin');
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setNeedsVerification(false);
    setPendingVerificationEmail(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    needsVerification,
    setNeedsVerification,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
