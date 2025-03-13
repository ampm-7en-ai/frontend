
import React from 'react';
import { Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AgentModelBadgeProps {
  model: string;
  getModelBadgeColor: (model: string) => string;
}

const AgentModelBadge = ({ model, getModelBadgeColor }: AgentModelBadgeProps) => {
  return (
    <Badge variant="outline" className={`${getModelBadgeColor(model)} text-xs font-medium py-0.5 h-5`}>
      <Brain className="h-3 w-3 mr-1" />
      {model}
    </Badge>
  );
};

export default AgentModelBadge;
