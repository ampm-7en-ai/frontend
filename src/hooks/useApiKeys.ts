
import { useState } from 'react';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used?: string;
  default: boolean;
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production',
      prefix: 'sk_prod_',
      created_at: '2023-05-10T00:00:00Z',
      last_used: '2023-06-01T00:00:00Z',
      default: true
    },
    {
      id: '2',
      name: 'Development',
      prefix: 'sk_dev_',
      created_at: '2023-05-15T00:00:00Z',
      default: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // In a real application, this would fetch from an API
  // For now we'll use the mock data initialized above
  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call timing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would be:
      // const response = await fetch(`${BASE_URL}/api-keys`, {
      //   headers: getAuthHeaders(user?.accessToken || '')
      // });
      // const data = await response.json();
      // setApiKeys(data);
      
      // We're using the mock data already set in state
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
      // Mock API call timing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newKeyId = `${Math.floor(Math.random() * 1000) + 3}`;
      const newKeySecret = `sk_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 15)}`;
      const newKey: ApiKey = {
        id: newKeyId,
        name,
        prefix: `sk_${name.toLowerCase().replace(/\s+/g, '_').substring(0, 5)}_`,
        created_at: new Date().toISOString(),
        default: false
      };
      
      setApiKeys([...apiKeys, newKey]);
      return newKeySecret;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create API key'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call timing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete API key'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchApiKeys when the component mounts
  // In a real app, this would be in a useEffect
  // useEffect(() => {
  //   fetchApiKeys();
  // }, []);

  return {
    apiKeys,
    isLoading,
    error,
    createApiKey,
    deleteApiKey,
    fetchApiKeys
  };
}
