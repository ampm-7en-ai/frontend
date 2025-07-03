
import React from 'react';
import { useBuilder } from './BuilderContext';
import { FileText, Brain, Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

export const GuidelinesPanel = () => {
  const { state, dispatch } = useBuilder();
  const { agentData } = state;

  const handleSystemPromptChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { systemPrompt: value }
    });
  };

  const handlePersonalityChange = (value: string) => {
    dispatch({
      type: 'UPDATE_AGENT_DATA',
      payload: { personality: value }
    });
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Guidelines & Behavior
        </h2>
      </div>
      
      <ScrollArea className="flex-1 p-4" hideScrollbar>
        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="system-prompt" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">System Instructions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3">
                <Label htmlFor="system-prompt" className="text-sm font-medium">
                  System Prompt
                </Label>
                <Textarea
                  id="system-prompt"
                  placeholder="Define how your agent should behave, what it should know, and how it should respond to users..."
                  value={agentData.systemPrompt || ''}
                  onChange={(e) => handleSystemPromptChange(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This guides your agent's core behavior and knowledge base
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="personality" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Personality & Tone</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3">
                <Label htmlFor="personality" className="text-sm font-medium">
                  Personality Description
                </Label>
                <Textarea
                  id="personality"
                  placeholder="Describe your agent's personality, tone of voice, and communication style..."
                  value={agentData.personality || ''}
                  onChange={(e) => handlePersonalityChange(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Define how your agent communicates and interacts with users
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
};
