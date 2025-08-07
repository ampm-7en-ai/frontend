
import { LLMProvider } from '@/hooks/useLLMProviders';

// Simplified model option interface for non-admin usage
export interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

// Updated model display names including new Mistral models
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // OpenAI models
  'gpt-4o': 'GPT-4o',
  'gpt-4': 'GPT-4',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  
  // Mistral models
  'mistral-large': 'Mistral Large',
  'mistral-medium': 'Mistral Medium',
  'mistral-small': 'Mistral Small',
  'mistral-large-latest': 'Mistral Large',
  'mistral-medium-latest': 'Mistral Medium',
  'mistral-small-latest': 'Mistral Small',
  
  // Google models
  'gemini-pro': 'Gemini Pro',
  'gemini-pro-vision': 'Gemini Pro Vision',
  
  // Anthropic models
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'claude-3-haiku': 'Claude 3 Haiku'
};

export const transformProvidersToModelOptions = (providers: LLMProvider[]): ModelOption[] => {
  const modelOptions: ModelOption[] = [];

  providers.forEach(provider => {
    provider.models.map((model) => {
      //const displayName = MODEL_DISPLAY_NAMES[modelKey] || modelKey;
      console.log("pipip",model);
      modelOptions.push({
        value: model.name,
        label: model.display_name,
        provider: provider.provider_name
      });
    });
  });

  return modelOptions;
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

export const getDefaultModelName = (provider: LLMProvider): string | null => {
  return provider.default_model;
};

// Fallback model options when API fails
export const getFallbackModelOptions = (): ModelOption[] => {
  return [
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', provider: 'OpenAI' },
    { value: 'gpt-4', label: 'GPT-4 (OpenAI)', provider: 'OpenAI' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', provider: 'OpenAI' }
  ];
};
