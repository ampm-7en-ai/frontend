
import React from 'react';
import { ApiKnowledgeBase } from './types';
import KnowledgeSourceList from './KnowledgeSourceList';

interface AgentKnowledgeContainerProps {
  agentId: string;
  knowledgeBases?: ApiKnowledgeBase[];
  isLoading?: boolean;
}

const AgentKnowledgeContainer: React.FC<AgentKnowledgeContainerProps> = ({
  agentId,
  knowledgeBases = [],
  isLoading = false,
}) => {
  return (
    <div className="space-y-6">
      <KnowledgeSourceList 
        knowledgeBases={knowledgeBases}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AgentKnowledgeContainer;
