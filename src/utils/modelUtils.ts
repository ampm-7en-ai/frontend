
import { LLMProvider } from '@/hooks/useLLMProviders';

export interface ModelOption {
  value: string;
  label: string;
  provider: string;
  providerId: number;
  isActive: boolean;
}

export interface ProviderModelMap {
  'OpenAI': string[];
  'Mistral AI': string[];
  'Google AI': string[];
  'Anthropic': string[];
}

// Model display names - fallback for when API doesn't provide display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4': 'GPT-4',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'mistral-large-latest': 'Mistral Large',
  'mistral-medium-latest': 'Mistral Medium',
  'mistral-small-latest': 'Mistral Small',
  'gemini-pro': 'Gemini Pro',
  'gemini-pro-vision': 'Gemini Pro Vision',
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'claude-3-haiku': 'Claude 3 Haiku'
};

export const transformProvidersToModelOptions = (providers: LLMProvider[]): ModelOption[] => {
  const modelOptions: ModelOption[] = [];

  providers.forEach(provider => {
    // Use the models array directly from the API response
    const providerModels = provider.models || [];
    
    providerModels.forEach(modelKey => {
      modelOptions.push({
        value: modelKey,
        label: `${MODEL_DISPLAY_NAMES[modelKey] || modelKey} (${provider.provider_name})`,
        provider: provider.provider_name,
        providerId: provider.id,
        isActive: provider.is_active
      });
    });
  });

  return modelOptions;
};

export const getActiveModelOptions = (providers: LLMProvider[]): ModelOption[] => {
  return transformProvidersToModelOptions(providers).filter(option => option.isActive);
};

export const getModelDisplay = (modelKey: string): string => {
  return MODEL_DISPLAY_NAMES[modelKey] || modelKey;
};

export const getModelProvider = (modelKey: string, providers: LLMProvider[]): string => {
  for (const provider of providers) {
    const providerModels = provider.models || [];
    if (providerModels.includes(modelKey)) {
      return provider.provider_name;
    }
  }
  return 'Unknown';
};

// Fallback model options when API fails
export const getFallbackModelOptions = (): ModelOption[] => {
  return [
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', provider: 'OpenAI', providerId: 0, isActive: true },
    { value: 'gpt-4', label: 'GPT-4 (OpenAI)', provider: 'OpenAI', providerId: 0, isActive: true },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', provider: 'OpenAI', providerId: 0, isActive: true }
  ];
};
