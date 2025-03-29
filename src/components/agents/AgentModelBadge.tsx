
import React from 'react';
import { Brain } from 'lucide-react';

interface AgentModelBadgeProps {
  model: string;
  getModelBadgeColor: (model: string) => string;
}

const AgentModelBadge = ({ model, getModelBadgeColor }: AgentModelBadgeProps) => {
  const getModelStyles = () => {
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
  };

  return (
    <div className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium border ${getModelStyles()}`}>
      <Brain className="h-2.5 w-2.5 mr-0.5" />
      {model}
    </div>
  );
};

export default AgentModelBadge;
