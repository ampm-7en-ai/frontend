
export const MODELS = {
  'gpt-4o': { name: 'GPT-4o', provider: 'OpenAI' },
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'OpenAI' },
  'mistral-large-latest': { name: 'Mistral Large', provider: 'Mistral AI' },
  'mistral-medium-latest': { name: 'Mistral Medium', provider: 'Mistral AI' },
  'mistral-small-latest': { name: 'Mistral Small', provider: 'Mistral AI' }
};

export const getModelDisplay = (modelKey: string): string => {
  return (MODELS as any)[modelKey]?.name || modelKey;
};
