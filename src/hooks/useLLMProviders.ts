import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from '@/utils/api-config';
import { apiGet } from '@/utils/api-interceptor';

// Model object structure
export interface ModelObject {
  id: number;
  name: string;
  provider_config?: number;
  created_at?: string;
  updated_at?: string;
  display_name: string;
}

// Non-admin simplified provider structure - FIXED: models is now array
export interface LLMProvider {
  provider_name: string;
  models: ModelObject[]; // FIXED: Changed from ModelObject to ModelObject[]
  default_model: string | null;
}

// Superadmin provider structure (completely separate from LLMProvider)
export interface SuperAdminLLMProvider {
  id: number;
  provider_name: string;
  api_key?: string;
  _api_key?: string;
  is_active: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
  models: ModelObject[] | string[];
  default_model: ModelObject | string | null;
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
