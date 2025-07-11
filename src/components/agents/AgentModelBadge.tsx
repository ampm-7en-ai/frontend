
import React from 'react';
import { Brain } from 'lucide-react';
import { useAIModels } from '@/hooks/useAIModels';

interface AgentModelBadgeProps {
  model: string;
  getModelBadgeColor?: (model: string) => string; // Make optional
}

const AgentModelBadge = ({ model, getModelBadgeColor }: AgentModelBadgeProps) => {
  const { getModelByValue } = useAIModels();
  
  const modelOption = getModelByValue(model);
  
  const getModelStyles = () => {
    if (getModelBadgeColor) {
      const colorName = getModelBadgeColor(model);
      
      switch (colorName) {
        case 'indigo':
          return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'green':
          return 'bg-green-50 text-green-700 border-green-200';
        case 'purple':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'blue':
        default:
          return 'bg-blue-50 text-blue-700 border-blue-200';
      }
    }
    
    // Default styling based on provider
    if (modelOption?.provider === 'OpenAI') {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (modelOption?.provider === 'Mistral AI') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (modelOption?.provider === 'Google AI') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (modelOption?.provider === 'Anthropic') {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium border ${getModelStyles()}`}>
      <Brain className="h-2.5 w-2.5 mr-0.5" />
      {modelOption?.label || model}
    </div>
  );
};

export default AgentModelBadge;
