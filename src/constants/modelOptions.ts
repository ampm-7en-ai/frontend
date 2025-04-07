
export const MODELS = [
  { value: 'gpt4', label: 'GPT-4' },
  { value: 'gpt35', label: 'GPT-3.5' },
  { value: 'llama', label: 'Llama 3' },
  { value: 'anthropic', label: 'Claude (Anthropic)' },
  { value: 'deepseek', label: 'DeepSeek' }
];

export const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Your goal is to assist users with their questions and problems in a clear and concise manner.";

export const getModelDisplay = (modelId: string): string => {
  const model = MODELS.find(m => m.value === modelId);
  return model ? model.label : modelId;
};
