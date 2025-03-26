
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, authData?: AuthData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  userId: number;
  role: UserRole;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string, authData?: AuthData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If authData is provided, we use it (API response)
      if (authData) {
        const userData = {
          id: authData.userId.toString(),
          name: username,
          email: `${username}@example.com`, // This would come from the API in a real app
          role: authData.role,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          avatar: `https://ui-avatars.com/api/?name=${username}&background=0D8ABC&color=fff`,
          ...(authData.role === 'admin' ? { businessId: 'b1' } : {})
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
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
          refreshToken: 'mock-refresh-token'
        };
        setUser(superAdminUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(superAdminUser));
        navigate('/');
      } else if (username === 'admin' && password === '123456') {
        const adminUser = {
          id: '2',
          name: 'Business Admin',
          email: 'admin@example.com',
          role: 'admin' as UserRole,
          businessId: 'b1',
          avatar: 'https://ui-avatars.com/api/?name=Business+Admin&background=0D8ABC&color=fff',
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token'
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(adminUser));
        navigate('/');
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
