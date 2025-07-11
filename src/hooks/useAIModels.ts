
import { useMemo } from 'react';
import { useLLMProviders } from './useLLMProviders';
import { 
  transformProvidersToModelOptions, 
  getActiveModelOptions, 
  getFallbackModelOptions,
  ModelOption
} from '@/utils/modelUtils';

export const useAIModels = () => {
  const { providers, isLoading } = useLLMProviders();

  const allModelOptions = useMemo(() => {
    if (!providers || providers.length === 0) {
      return getFallbackModelOptions();
    }
    return transformProvidersToModelOptions(providers);
  }, [providers]);

  const activeModelOptions = useMemo(() => {
    if (!providers || providers.length === 0) {
      return getFallbackModelOptions();
    }
    return getActiveModelOptions(providers);
  }, [providers]);

  const modelOptionsForDropdown = useMemo(() => {
    return activeModelOptions.map(option => ({
      value: option.value,
      label: option.label
    }));
  }, [activeModelOptions]);

  const getModelByValue = (value: string): ModelOption | undefined => {
    return allModelOptions.find(option => option.value === value);
  };

  return {
    providers,
    allModelOptions,
    activeModelOptions,
    modelOptionsForDropdown,
    isLoading,
    getModelByValue
  };
};
