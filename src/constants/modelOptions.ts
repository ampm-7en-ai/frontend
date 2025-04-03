
export const MODELS = {
  'gpt4': { name: 'GPT-4', provider: 'OpenAI' },
  'gpt35': { name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  'anthropic': { name: 'Claude 3', provider: 'Anthropic' },
  'mistral': { name: 'Mistral 7B', provider: 'Mistral AI' },
  'llama': { name: 'Llama-3.1-70B-Instruct', provider: 'Meta AI' },
  'gemini': { name: 'Gemini Pro', provider: 'Google' },
  'mixtral': { name: 'Mixtral 8x7B', provider: 'Mistral AI' },
  'deepseek': { name: 'DeepSeek-R1', provider: 'DeepSeek' }
};

export const getModelDisplay = (modelKey: string): string => {
  return (MODELS as any)[modelKey]?.name || modelKey;
};
