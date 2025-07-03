
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Brain } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const KnowledgePanel = () => {
  const { state } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Knowledge Base
        </h2>
      </div>
      
      <div className="p-4">
        <Accordion type="single" defaultValue="knowledge" className="space-y-4">
          <AccordionItem value="knowledge" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Training & Sources</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <KnowledgeTrainingStatus
                agentId={agentData.id?.toString() || 'preview-agent'}
                agentName={agentData.name || 'New Agent'}
                preloadedKnowledgeSources={[]}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
