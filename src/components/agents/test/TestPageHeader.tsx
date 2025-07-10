
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Book } from 'lucide-react';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TestPageHeaderProps {
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
  onClearChat: () => void;
  onViewKnowledgeSources?: () => void;
  knowledgeSourceCount?: number;
  agents: any[];
  isLoading: boolean;
}

export const TestPageHeader = ({ 
  selectedAgentId, 
  onAgentChange, 
  onClearChat,
  onViewKnowledgeSources,
  knowledgeSourceCount = 0,
  agents,
  isLoading
}: TestPageHeaderProps) => {
  const agentOptions = agents.map((agent: any) => ({
    value: agent.id,
    label: agent.name,
    description: `${agent.status || 'Draft'} • ${agent.model || 'GPT-3.5'}`
  }));

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-center mb-2">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">7en.ai</h1>
          <h2 className="text-xl font-semibold">AI Playground</h2>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-[280px] h-10 flex items-center justify-center border rounded-md">
              <LoadingSpinner size="sm" text="Loading agents..." />
            </div>
          ) : (
            <ModernDropdown
              value={selectedAgentId}
              onValueChange={onAgentChange}
              options={agentOptions}
              placeholder="Select agent"
              className="w-full sm:w-[280px]"
              disabled={isLoading}
              renderOption={(option) => (
                <div className="flex items-center">
                  {agents.find(a => a.id === option.value)?.avatarSrc ? (
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={agents.find(a => a.id === option.value)?.avatarSrc} alt={option.label} />
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  ) : (
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                  )}
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              )}
            />
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {onViewKnowledgeSources && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewKnowledgeSources}
                  className="flex items-center gap-1"
                >
                  <Book className="h-4 w-4 mr-1" />
                  Knowledge Sources
                  {knowledgeSourceCount > 0 && (
                    <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                      {knowledgeSourceCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View agent knowledge sources</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearChat}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      </div>
    </div>
  );
};
