
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';

export interface LLMProvider {
  id: number;
  provider_name: string;
  api_key?: string;
  default_model: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface LLMProvidersResponse {
  message: string;
  data: LLMProvider[];
  status: string;
}

export const useLLMProviders = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl('admin/provider-configs/'), {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data: LLMProvidersResponse = await response.json();
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

  const updateProvider = async (providerId: number, updateData: Partial<LLMProvider>) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(`admin/provider-configs/${providerId}/`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update provider');
      }

      const data = await response.json();
      
      // Update the provider in the list
      setProviders(prev => 
        prev.map(provider => 
          provider.id === providerId ? { ...provider, ...data.data } : provider
        )
      );

      toast({
        title: "Success",
        description: data.message || "Provider updated successfully",
        variant: "default"
      });

      return data.data;
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: "Error",
        description: "Failed to update provider",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    isLoading,
    refetch: fetchProviders,
    updateProvider
  };
};
