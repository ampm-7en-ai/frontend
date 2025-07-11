
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from '@/utils/api-config';
import { apiGet } from '@/utils/api-interceptor';

export interface ModelObject {
  id: number;
  name: string;
  display_name?: string;
}

export interface LLMProvider {
  id?: number; // Optional for non-superadmin endpoints
  provider_name: string;
  models: string[] | ModelObject[];
  default_model: string | null | ModelObject;
  is_active?: boolean; // Optional for non-superadmin endpoints
  status?: string;
  _api_key?: boolean;
  api_key?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProvidersResponse {
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
      console.log('Fetching providers from provider-configs/');
      
      const response = await apiGet(getApiUrl('provider-configs/'));

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data: ProvidersResponse = await response.json();
      console.log('Providers response:', data);
      
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
