
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { settingsApi } from '@/utils/api-config';

interface Settings {
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  // Add other settings properties as needed
  [key: string]: any;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateSettings = async (payload: Partial<Settings>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await settingsApi.update(payload);
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
      
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
    error
  };
};
