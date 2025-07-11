
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
    console.log('useAIModels - Raw providers:', providers);
    
    if (!providers || providers.length === 0) {
      console.log('useAIModels - No providers, using fallback');
      return getFallbackModelOptions();
    }
    
    const transformed = transformProvidersToModelOptions(providers);
    console.log('useAIModels - Transformed model options:', transformed);
    return transformed;
  }, [providers]);

  const activeModelOptions = useMemo(() => {
    if (!providers || providers.length === 0) {
      console.log('useAIModels - No providers for active options, using fallback');
      return getFallbackModelOptions();
    }
    
    const active = getActiveModelOptions(providers);
    console.log('useAIModels - Active model options:', active);
    return active;
  }, [providers]);

  const modelOptionsForDropdown = useMemo(() => {
    const options = activeModelOptions.map(option => ({
      value: option.value,
      label: option.label
    }));
    console.log('useAIModels - Dropdown options:', options);
    return options;
  }, [activeModelOptions]);

  const getModelByValue = (value: string): ModelOption | undefined => {
    return allModelOptions.find(option => option.value === value);
  };

  console.log('useAIModels - Final state:', {
    providers: providers?.length,
    allModelOptions: allModelOptions.length,
    activeModelOptions: activeModelOptions.length,
    modelOptionsForDropdown: modelOptionsForDropdown.length,
    isLoading
  });

  return {
    providers,
    allModelOptions,
    activeModelOptions,
    modelOptionsForDropdown,
    isLoading,
    getModelByValue
  };
};
