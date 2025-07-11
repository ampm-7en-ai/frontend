
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '@/utils/api-config';

export interface ModelObject {
  id: number;
  name: string;
  provider_config: number;
  provider_config_name?: string;
  created_at: string;
  updated_at: string;
}

export interface LLMProvider {
  id?: number; // Optional for non-superadmin
  provider_name: string;
  models: string[] | ModelObject[]; // Support both formats
  default_model: string | null | ModelObject; // Support both formats
  is_active?: boolean; // Optional for non-superadmin
  _api_key?: string | boolean; // Optional for non-superadmin
}

const fetchProviders = async (): Promise<LLMProvider[]> => {
  try {
    console.log('Fetching LLM providers...');
    const response = await fetchFromApi('/provider-configs/');
    console.log('LLM Providers API Response:', response);
    
    if (response && response.data) {
      return response.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching LLM providers:', error);
    throw error;
  }
};

export const useLLMProviders = () => {
  const { data: providers, isLoading, error, refetch } = useQuery({
    queryKey: ['llm-providers'],
    queryFn: fetchProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    providers: providers || [],
    isLoading,
    error,
    refetch
  };
};
