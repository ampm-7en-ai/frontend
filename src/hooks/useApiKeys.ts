import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiPost, apiDelete } from '@/utils/api-interceptor';
import { useAuth } from '@/context/AuthContext';

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

async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await apiGet(getApiUrl('v1/keys/'));

  if (!response.ok) {
    throw new Error('Failed to fetch API keys');
  }

  const data: ApiKeysResponse = await response.json();
  return data.data.api_keys;
}

export function useApiKeys() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: fetchApiKeys,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: isAuthenticated,
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiPost(getApiUrl('v1/keys/'), { name });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data: ApiKeyCreateResponse = await response.json();
      return data.data.raw_key;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiDelete(getApiUrl(`v1/keys/${keyId}/`));

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  const refreshApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiPost(getApiUrl('v1/keys/refresh/'), { id: keyId });

      if (!response.ok) {
        throw new Error('Failed to refresh API key');
      }

      const data: ApiKeyCreateResponse = await response.json();
      return data.data.raw_key;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  return {
    apiKeys,
    isLoading: isLoading || createApiKeyMutation.isPending || deleteApiKeyMutation.isPending || refreshApiKeyMutation.isPending,
    error,
    createApiKey: createApiKeyMutation.mutateAsync,
    deleteApiKey: deleteApiKeyMutation.mutateAsync,
    refreshApiKey: refreshApiKeyMutation.mutateAsync,
  };
}
