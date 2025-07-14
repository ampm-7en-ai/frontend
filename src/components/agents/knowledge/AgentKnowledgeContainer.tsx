
import React from 'react';
import { ApiKnowledgeBase } from './types';
import KnowledgeSourceList from './KnowledgeSourceList';

interface AgentKnowledgeContainerProps {
  agentId: string;
  knowledgeBases?: ApiKnowledgeBase[];
  isLoading?: boolean;
  onKnowledgeBaseRemoved?: (knowledgeBaseId: number) => void;
}

const AgentKnowledgeContainer: React.FC<AgentKnowledgeContainerProps> = ({
  agentId,
  knowledgeBases = [],
  isLoading = false,
  onKnowledgeBaseRemoved,
}) => {
  return (
    <div className="space-y-6">
      <KnowledgeSourceList 
        knowledgeBases={knowledgeBases}
        isLoading={isLoading}
        agentId={agentId}
        onKnowledgeBaseRemoved={onKnowledgeBaseRemoved}
      />
    </div>
  );
};

export default AgentKnowledgeContainer;
