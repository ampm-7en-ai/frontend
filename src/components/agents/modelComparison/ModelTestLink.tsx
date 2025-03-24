
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelTestLink as ModelTestLinkType } from './types';

interface ModelTestLinkProps {
  modelInfo: ModelTestLinkType;
  agentId?: string;
  className?: string;
}

const ModelTestLink: React.FC<ModelTestLinkProps> = ({ 
  modelInfo, 
  agentId = "1",
  className = "" 
}) => {
  const { model, label = "Try in Model Lab", openInNewTab = true } = modelInfo;
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`text-xs ${className}`}
      asChild
    >
      <Link 
        to={`/agents/${agentId}/test?model=${model}`}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {label}
        {openInNewTab && <ExternalLink className="ml-1.5 h-3 w-3" />}
      </Link>
    </Button>
  );
};

export default ModelTestLink;
