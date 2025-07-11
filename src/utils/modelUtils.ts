
import { LLMProvider } from '@/hooks/useLLMProviders';

export interface ModelOption {
  value: string;
  label: string;
  provider: string;
  isActive: boolean;
}

// Model display names - fallback for when API doesn't provide display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4': 'GPT-4',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'mistral-large': 'Mistral Large',
  'mistral-medium': 'Mistral Medium',
  'mistral-small': 'Mistral Small',
  'gemini-pro': 'Gemini Pro',
  'gemini-pro-vision': 'Gemini Pro Vision',
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'claude-3-haiku': 'Claude 3 Haiku'
};

export const transformProvidersToModelOptions = (providers: LLMProvider[]): ModelOption[] => {
  const modelOptions: ModelOption[] = [];

  providers.forEach(provider => {
    provider.models.forEach(modelKey => {
      modelOptions.push({
        value: modelKey,
        label: `${MODEL_DISPLAY_NAMES[modelKey] || modelKey} (${provider.provider_name})`,
        provider: provider.provider_name,
        isActive: true // All models from API are considered active
      });
    });
  });

  return modelOptions;
};

export const getActiveModelOptions = (providers: LLMProvider[]): ModelOption[] => {
  return transformProvidersToModelOptions(providers);
};

export const getModelDisplay = (modelKey: string): string => {
  return MODEL_DISPLAY_NAMES[modelKey] || modelKey;
};

export const getModelProvider = (modelKey: string, providers: LLMProvider[]): string => {
  for (const provider of providers) {
    if (provider.models.includes(modelKey)) {
      return provider.provider_name;
    }
  }
  return 'Unknown';
};

// Fallback model options when API fails
export const getFallbackModelOptions = (): ModelOption[] => {
  return [
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', provider: 'OpenAI', isActive: true },
    { value: 'gpt-4', label: 'GPT-4 (OpenAI)', provider: 'OpenAI', isActive: true },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', provider: 'OpenAI', isActive: true }
  ];
};
