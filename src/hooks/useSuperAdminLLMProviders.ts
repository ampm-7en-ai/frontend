
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiRequest } from '@/utils/api-interceptor';
import { LLMProvider, ModelObject } from './useLLMProviders';

interface SuperAdminProvidersResponse {
  message: string;
  data: LLMProvider[];
  status: string;
}

export const useSuperAdminLLMProviders = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching superadmin providers from admin/provider-configs/');
      
      const response = await apiGet(getApiUrl('admin/provider-configs/'));

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data: SuperAdminProvidersResponse = await response.json();
      console.log('Superadmin providers response:', data);
      
      setProviders(data.data);
    } catch (error) {
      console.error('Error fetching superadmin providers:', error);
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
      const response = await apiRequest(getApiUrl(`admin/provider-configs/${providerId}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
