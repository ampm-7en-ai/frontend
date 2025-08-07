import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiRequest } from '@/utils/api-interceptor';
import { SuperAdminLLMProvider, ModelObject } from './useLLMProviders';

interface SuperAdminProvidersResponse {
  message: string;
  data: SuperAdminLLMProvider[];
  status: string;
}

export const useSuperAdminLLMProviders = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<SuperAdminLLMProvider[]>([]);
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

  const updateProvider = async (providerId: number, updateData: Partial<SuperAdminLLMProvider>) => {
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

  const addModel = async (providerId: number, modelName: string, displayName: string) => {
    try {
      const response = await apiRequest(getApiUrl('admin/provider-models/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_config: providerId,
          name: modelName,
          display_name: displayName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add model');
      }

      const data = await response.json();
      
      // Refresh providers to get the updated models list
      await fetchProviders();

      toast({
        title: "Success",
        description: data.message || "Model added successfully",
        variant: "default"
      });

      return data.data;
    } catch (error) {
      console.error('Error adding model:', error);
      toast({
        title: "Error",
        description: "Failed to add model",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteModel = async (modelId: number) => {
    try {
      const response = await apiRequest(getApiUrl(`admin/provider-models/${modelId}/`), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete model');
      }

      // Refresh providers to get the updated models list
      await fetchProviders();

      toast({
        title: "Success",
        description: "Model deleted successfully",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error deleting model:', error);
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive"
      });
      throw error;
    }
  };

  const setDefaultModel = async (providerId: number, modelId: number) => {
    try {
      const response = await apiRequest(getApiUrl(`admin/provider-configs/${providerId}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_model_id: modelId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to set default model');
      }

      const data = await response.json();
      
      // Refresh providers to get the updated default model
      await fetchProviders();

      toast({
        title: "Success",
        description: data.message || "Default model updated successfully",
        variant: "default"
      });

      return data.data;
    } catch (error) {
      console.error('Error setting default model:', error);
      toast({
        title: "Error",
        description: "Failed to set default model",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProvider = async (providerId: number) => {
    try {
      const response = await apiRequest(getApiUrl(`admin/provider-configs/${providerId}/`), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete provider');
      }

      // Remove provider from the list
      setProviders(prev => prev.filter(provider => provider.id !== providerId));

      toast({
        title: "Success",
        description: "Provider deleted successfully",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: "Error",
        description: "Failed to delete provider",
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
    updateProvider,
    addModel,
    deleteModel,
    setDefaultModel,
    deleteProvider
  };
};
