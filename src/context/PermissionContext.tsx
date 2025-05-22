
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from '@/utils/api-config';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Permission {
  id: number;
  name: string;
  description: string;
}

interface PermissionContextType {
  availablePermissions: Permission[];
  isLoading: boolean;
  fetchPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE_PERMISSIONS), {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setAvailablePermissions(data.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load available permissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <PermissionContext.Provider value={{ availablePermissions, isLoading, fetchPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};
