
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AddProviderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderAdded: () => void;
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
    value: 'OpenAI', 
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'] 
  },
  { 
    value: 'Anthropic', 
    label: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] 
  },
  { 
    value: 'Google AI', 
    label: 'Google AI',
    models: ['gemini-pro', 'gemini-ultra'] 
  },
  { 
    value: 'Mistral AI', 
    label: 'Mistral AI',
    models: ['mistral-large', 'mistral-medium', 'mistral-small'] 
  }
];

const AddProviderDialog = ({ isOpen, onClose, onProviderAdded }: AddProviderDialogProps) => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProviderFormData>({
    provider_name: '',
    api_key: '',
    default_model: '',
    is_active: true,
    status: 'active'
  });

  const selectedProvider = providerOptions.find(p => p.value === formData.provider_name);
  const modelOptions = selectedProvider?.models.map(model => ({
    value: model,
    label: model,
  })) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider_name || !formData.api_key || !formData.default_model) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl('admin/provider-configs/'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create provider configuration');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message || "Provider configuration created successfully",
        variant: "default"
      });

      onProviderAdded();
      onClose();
      
      // Reset form
      setFormData({
        provider_name: '',
        api_key: '',
        default_model: '',
        is_active: true,
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating provider:', error);
      toast({
        title: "Error",
        description: "Failed to create provider configuration",
        variant: "destructive"
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Provider</DialogTitle>
          <DialogDescription>
            Configure a new LLM provider for your platform
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider_name">Provider Name *</Label>
            <ModernDropdown
              value={formData.provider_name}
              onValueChange={handleProviderChange}
              options={providerOptions}
              placeholder="Select provider"
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
              options={modelOptions}
              placeholder="Select model"
              disabled={!selectedProvider}
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0" />
                  Creating...
                </>
              ) : (
                'Create Provider'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProviderDialog;
