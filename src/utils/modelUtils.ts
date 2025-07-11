
import { LLMProvider, ModelObject } from '@/hooks/useLLMProviders';

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
  'mistral-large': 'Mistral Large',
  'mistral-medium': 'Mistral Medium',  
  'mistral-small': 'Mistral Small',
  'mistral-large-latest': 'Mistral Large',
  'mistral-medium-latest': 'Mistral Medium',
  'mistral-small-latest': 'Mistral Small',
  'gemini-pro': 'Gemini Pro',
  'gemini-pro-vision': 'Gemini Pro Vision',
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'claude-3-haiku': 'Claude 3 Haiku'
};

// Helper function to extract model names from different structures
const extractModelNames = (models: string[] | ModelObject[]): string[] => {
  if (!models || models.length === 0) return [];
  
  // If it's an array of strings (non-superadmin endpoint)
  if (typeof models[0] === 'string') {
    return models as string[];
  }
  
  // If it's an array of model objects (superadmin endpoint)
  return (models as ModelObject[]).map(model => model.name);
};

// Helper function to extract default model name
const extractDefaultModelName = (defaultModel: string | null | ModelObject): string | null => {
  if (!defaultModel) return null;
  
  // If it's a string (non-superadmin endpoint)
  if (typeof defaultModel === 'string') {
    return defaultModel;
  }
  
  // If it's a model object (superadmin endpoint)
  if (typeof defaultModel === 'object' && 'name' in defaultModel) {
    return defaultModel.name;
  }
  
  return null;
};

export const transformProvidersToModelOptions = (providers: LLMProvider[]): ModelOption[] => {
  const modelOptions: ModelOption[] = [];

  providers.forEach((provider, index) => {
    // Extract model names from both endpoint structures
    const providerModels = extractModelNames(provider.models);
    
    providerModels.forEach(modelKey => {
      modelOptions.push({
        value: modelKey,
        label: `${MODEL_DISPLAY_NAMES[modelKey] || modelKey} (${provider.provider_name})`,
        provider: provider.provider_name,
        providerId: provider.id || index, // Use index as fallback for non-superadmin
        isActive: provider.is_active !== false // Default to true if not specified
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
    const providerModels = extractModelNames(provider.models);
    if (providerModels.includes(modelKey)) {
      return provider.provider_name;
    }
  }
  return 'Unknown';
};

export const getDefaultModelName = (provider: LLMProvider): string | null => {
  return extractDefaultModelName(provider.default_model);
};

// Fallback model options when API fails
export const getFallbackModelOptions = (): ModelOption[] => {
  return [
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', provider: 'OpenAI', providerId: 0, isActive: true },
    { value: 'gpt-4', label: 'GPT-4 (OpenAI)', provider: 'OpenAI', providerId: 0, isActive: true },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', provider: 'OpenAI', providerId: 0, isActive: true }
  ];
};
