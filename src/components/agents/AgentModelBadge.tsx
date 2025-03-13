
import React from 'react';
import { Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AgentModelBadgeProps {
  model: string;
  getModelBadgeColor: (model: string) => string;
}

const AgentModelBadge = ({ model, getModelBadgeColor }: AgentModelBadgeProps) => {
  return (
    <Badge variant="outline" className={`${getModelBadgeColor(model)} text-xs font-medium py-0 h-4 px-1.5`}>
      <Brain className="h-2.5 w-2.5 mr-0.5" />
      {model}
    </Badge>
  );
};

export default AgentModelBadge;
