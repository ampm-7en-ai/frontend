
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiPost, apiDelete } from '@/utils/api-interceptor';

export interface ApiKey {
  id: number;
  name: string;
  masked_key: string;
  created_at: string;
}

export interface ApiKeysResponse {
  message: string;
  data: {
    api_keys: ApiKey[];
    names: string[];
    count: number;
  };
  status: string;
  permissions: string[];
}

export interface ApiKeyCreateResponse {
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
    name: string;
  };
  status: string;
  permissions: string[];
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiGet(getApiUrl('v1/keys/'));

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data: ApiKeysResponse = await response.json();
      setApiKeys(data.data.api_keys);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch API keys'));
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (name: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiPost(getApiUrl('v1/keys/'), { name });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data: ApiKeyCreateResponse = await response.json();
      
      // Refresh the keys list
      await fetchApiKeys();
      
      return data.data.raw_key;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create API key'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (keyId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiDelete(getApiUrl(`v1/keys/${keyId}/`));

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      // Refresh the keys list
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete API key'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return {
    apiKeys,
    isLoading,
    error,
    createApiKey,
    deleteApiKey,
    fetchApiKeys
  };
}
