
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Brain } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import EnhancedKnowledgeSourceList from './EnhancedKnowledgeSourceList';
import { ScrollArea } from '@/components/ui/scroll-area';

export const KnowledgePanel = () => {
  const { state } = useBuilder();
  const { agentData } = state;

  // Fetch knowledge bases for this agent
  const { data: knowledgeBases = [], isLoading } = useQuery({
    queryKey: ['agentKnowledgeBases', agentData.id?.toString()],
    queryFn: async () => {
      if (!agentData.id) return [];
      
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}agents/${agentData.id}/knowledge-bases/`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent knowledge bases');
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: !!agentData.id
  });

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Knowledge Base
        </h2>
      </div>
      
      <ScrollArea className="flex-1 p-4" hideScrollbar>
        <Accordion type="single" className="space-y-4">
          <AccordionItem value="knowledge" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Knowledge Sources ({knowledgeBases.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <KnowledgeTrainingStatus
                  agentId={agentData.id?.toString() || 'preview-agent'}
                  agentName={agentData.name || 'New Agent'}
                  preloadedKnowledgeSources={[]}
                />
                <EnhancedKnowledgeSourceList
                  knowledgeBases={knowledgeBases}
                  isLoading={isLoading}
                  agentId={agentData.id?.toString()}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
};
