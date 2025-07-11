
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from '@/utils/api-config';
import { apiGet } from '@/utils/api-interceptor';

// Simplified provider structure for non-admin endpoints
export interface LLMProvider {
  provider_name: string;
  models: string[];
  default_model: string | null;
}

interface LLMProvidersResponse {
  message: string;
  data: LLMProvider[];
  status: string;
}

export const useLLMProviders = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet(getApiUrl('settings/provider-configs/'));

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data: LLMProvidersResponse = await response.json();
      console.log('Non-admin providers response:', data);
      setProviders(data.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load LLM providers",
        variant: "destructive"
      });
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    isLoading,
    refetch: fetchProviders
  };
};
