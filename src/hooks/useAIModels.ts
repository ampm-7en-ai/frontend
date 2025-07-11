
import { useMemo } from 'react';
import { useLLMProviders } from './useLLMProviders';
import { 
  transformProvidersToModelOptions, 
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

  const modelOptionsForDropdown = useMemo(() => {
    const options = allModelOptions.map(option => ({
      value: option.value,
      label: option.label
    }));
    console.log('useAIModels - Dropdown options:', options);
    return options;
  }, [allModelOptions]);

  const getModelByValue = (value: string): ModelOption | undefined => {
    return allModelOptions.find(option => option.value === value);
  };

  console.log('useAIModels - Final state:', {
    providers: providers?.length,
    allModelOptions: allModelOptions.length,
    modelOptionsForDropdown: modelOptionsForDropdown.length,
    isLoading
  });

  return {
    providers,
    allModelOptions,
    modelOptionsForDropdown,
    isLoading,
    getModelByValue
  };
};
