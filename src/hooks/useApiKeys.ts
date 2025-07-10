
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiPost } from '@/utils/api-interceptor';

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

  const checkApiKeyExists = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiGet(getApiUrl('v1/keys/'));

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
      const response = await apiPost(getApiUrl('v1/keys/'), {});

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
      const response = await apiPost(getApiUrl('v1/keys/refresh/'), {});

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
    checkApiKeyExists();
  }, []);

  return {
    hasApiKey,
    isLoading,
    error,
    createApiKey,
    refreshApiKey,
    checkApiKeyExists
  };
}
