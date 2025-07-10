import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LLMProvider } from '@/hooks/useLLMProviders';
import AddProviderDialog from '@/components/settings/platform/AddProviderDialog';
import EditProviderDialog from '@/components/settings/platform/EditProviderDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
];

const LLMProvidersSettings = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isEditProviderOpen, setIsEditProviderOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchProviders = async (): Promise<LLMProvider[]> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(getApiUrl('admin/provider-configs/'), {
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch provider configurations');
    }

    const data = await response.json();
    return data.data;
  };

  const { 
    data: providers = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['llmProviders'],
    queryFn: fetchProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3
  });

  const createProviderMutation = useMutation(
    async (newProvider: Omit<LLMProvider, 'id'>) => {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl('admin/provider-configs/'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(newProvider)
      });

      if (!response.ok) {
        throw new Error('Failed to create provider configuration');
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['llmProviders']);
        toast({
          title: "Success",
          description: "Provider configuration created successfully",
          variant: "default"
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.message || "Failed to create provider configuration",
          variant: "destructive"
        });
      }
    }
  );

  const updateProviderMutation = useMutation(
    async ({ providerId, updateData }: { providerId: number, updateData: Partial<LLMProvider> }) => {
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
        throw new Error('Failed to update provider configuration');
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['llmProviders']);
        toast({
          title: "Success",
          description: "Provider configuration updated successfully",
          variant: "default"
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.message || "Failed to update provider configuration",
          variant: "destructive"
        });
      }
    }
  );

  const deleteProviderMutation = useMutation(
    async (providerId: number) => {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(`admin/provider-configs/${providerId}/`), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to delete provider configuration');
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['llmProviders']);
        toast({
          title: "Success",
          description: "Provider configuration deleted successfully",
          variant: "default"
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.message || "Failed to delete provider configuration",
          variant: "destructive"
        });
      }
    }
  );

  const handleAddProvider = () => {
    setIsAddProviderOpen(true);
  };

  const handleEditProvider = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setIsEditProviderOpen(true);
  };

  const handleCloseEditProvider = () => {
    setIsEditProviderOpen(false);
    setSelectedProvider(null);
  };

  const handleDeleteProvider = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteProvider = async () => {
    if (selectedProvider) {
      await deleteProviderMutation.mutateAsync(selectedProvider.id);
      setIsDeleteConfirmOpen(false);
      setSelectedProvider(null);
    }
  };

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied",
      description: "API key copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" text="Loading providers..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="my-6">
        <CardContent className="p-6">
          <div className="text-center py-10">
            <div className="text-destructive mb-2">Error loading providers</div>
            <p className="text-muted-foreground">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LLM Providers</h1>
          <p className="text-muted-foreground">
            Manage your Language Model Providers
          </p>
        </div>
        <Button onClick={handleAddProvider}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Configurations</CardTitle>
          <CardDescription>
            Configure and manage your LLM provider settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {providers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No providers configured yet.</p>
              </div>
            ) : (
              providers.map((provider) => (
                <div key={provider.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{provider.provider_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Default Model: {provider.default_model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {provider.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyApiKey(provider.api_key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditProvider(provider)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProvider(provider)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddProviderDialog
        isOpen={isAddProviderOpen}
        onClose={() => setIsAddProviderOpen(false)}
        onProviderAdded={() => refetch()}
      />

      <EditProviderDialog
        isOpen={isEditProviderOpen}
        onClose={handleCloseEditProvider}
        provider={selectedProvider}
        onProviderUpdated={updateProviderMutation.mutateAsync}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Provider"
        description="Are you sure you want to delete this provider configuration? This action cannot be undone."
        onConfirm={confirmDeleteProvider}
      />
    </div>
  );
};

export default LLMProvidersSettings;
