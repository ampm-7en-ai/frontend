
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';

export const KnowledgePanel = () => {
  const { state } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Knowledge Base
        </h2>
      </div>
      
      <div className="p-4">
        <KnowledgeTrainingStatus
          agentId={agentData.id?.toString() || 'preview-agent'}
          agentName={agentData.name || 'New Agent'}
          preloadedKnowledgeSources={[]}
        />
      </div>
    </div>
  );
};
