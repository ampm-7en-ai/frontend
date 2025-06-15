
import { useState, useEffect } from 'react';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';

export interface ApiKeyResponse {
  message: string;
  data: {
    id: number;
    team: number;
    owner: number;
    is_active: boolean;
    created_at: string;
    last_used_at: string | null;
    description: string;
    raw_key: string;
  };
  status: string;
  permissions: string[];
}

export interface ApiKeyExistenceResponse {
  message: string;
  data: {
    has_api_key: boolean;
  };
  status: string;
  permissions: string[];
}

export function useApiKeys() {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const checkApiKeyExists = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}v1/keys/`, {
        headers: getAuthHeaders(user?.accessToken || '')
      });

      if (!response.ok) {
        throw new Error('Failed to check API key existence');
      }

      const data: ApiKeyExistenceResponse = await response.json();
      setHasApiKey(data.data.has_api_key);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check API key existence'));
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}v1/keys/`, {
        method: 'POST',
        headers: getAuthHeaders(user?.accessToken || '')
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data: ApiKeyResponse = await response.json();
      setHasApiKey(true);
      return data.data.raw_key;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create API key'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshApiKey = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}v1/keys/refresh/`, {
        method: 'POST',
        headers: getAuthHeaders(user?.accessToken || '')
      });

      if (!response.ok) {
        throw new Error('Failed to refresh API key');
      }

      const data: ApiKeyResponse = await response.json();
      return data.data.raw_key;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh API key'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accessToken) {
      checkApiKeyExists();
    }
  }, [user?.accessToken]);

  return {
    hasApiKey,
    isLoading,
    error,
    createApiKey,
    refreshApiKey,
    checkApiKeyExists
  };
}
