
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { SuperAdminLLMProvider } from '@/hooks/useLLMProviders';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import ModernButton from '@/components/dashboard/ModernButton';

interface EditProviderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  provider: SuperAdminLLMProvider | null;
  onProviderUpdated: (providerId: number, updateData: Partial<SuperAdminLLMProvider>) => Promise<any>;
}

interface ProviderFormData {
  provider_name: string;
  api_key: string;
  default_model: string;
  is_active: boolean;
  status: string;
}

const providerOptions = [
  { 
    name: 'OpenAI', 
    models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'] 
  },
  { 
    name: 'Anthropic', 
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] 
  },
  { 
    name: 'Google AI', 
    models: ['gemini-pro', 'gemini-ultra'] 
  },
  { 
    name: 'Mistral AI', 
    models: ['mistral-large', 'mistral-medium', 'mistral-small'] 
  }
];

// Utility function to get default model name from SuperAdminLLMProvider
const getSuperAdminDefaultModelName = (provider: SuperAdminLLMProvider): string => {
  if (!provider.default_model) return '';
  
  // If default_model is an object, return its name
  if (typeof provider.default_model === 'object' && provider.default_model && 'name' in provider.default_model) {
    return provider.default_model.name;
  }
  
  // If default_model is a string, return it directly
  if (typeof provider.default_model === 'string') {
    return provider.default_model;
  }
  
  return '';
};

const EditProviderDialog = ({ isOpen, onClose, provider, onProviderUpdated }: EditProviderDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProviderFormData>({
    provider_name: '',
    api_key: '',
    default_model: '',
    is_active: true,
    status: 'active'
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        provider_name: provider.provider_name,
        api_key: provider.api_key || provider._api_key || '',
        default_model: getSuperAdminDefaultModelName(provider),
        is_active: provider.is_active,
        status: provider.status
      });
    }
  }, [provider]);

  const selectedProvider = providerOptions.find(p => p.name === formData.provider_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !formData.provider_name || !formData.api_key || !formData.default_model) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await onProviderUpdated(provider.id, formData);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      provider_name: value,
      default_model: '' // Reset model when provider changes
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked,
      status: checked ? 'active' : 'inactive'
    }));
  };

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogDescription>
            Update the configuration for {provider.provider_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider_name">Provider Name *</Label>
             <ModernDropdown
                value={formData.provider_name}
                onValueChange={handleProviderChange}
                options={providerOptions.map(u => ({value: u.name, label: u.name}))}
                placeholder="Select Providers"
                className="w-full text-xs rounded-xl border-neutral-200 dark:border-neutral-700"
              />
            
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key *</Label>
            <Input
              id="api_key"
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder="Enter API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_model">Default Model *</Label>
             <ModernDropdown
                value={formData.default_model}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_model: value }))}
                options={selectedProvider?.models.map(u => ({value: u, label: u}))}
                placeholder="Select Models"
                className="w-full text-xs rounded-xl border-neutral-200 dark:border-neutral-700"
              />
            
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleActiveChange}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <ModernButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </ModernButton>
            <ModernButton type="submit" disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Updating...
                </>
              ) : (
                'Update Provider'
              )}
            </ModernButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProviderDialog;
