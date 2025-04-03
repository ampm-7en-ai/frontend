
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

interface TestPageHeaderProps {
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
  onClearChat: () => void;
  agents: any[];
  isLoading: boolean;
}

export const TestPageHeader = ({ 
  selectedAgentId, 
  onAgentChange, 
  onClearChat, 
  agents,
  isLoading
}: TestPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-center mb-2">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">7en.ai</h1>
          <h2 className="text-xl font-semibold">AI Playground</h2>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Select 
          value={selectedAgentId} 
          onValueChange={onAgentChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent: any) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center">
                  {agent.avatarSrc ? (
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={agent.avatarSrc} alt={agent.name} />
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  ) : (
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                  )}
                  {agent.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
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
  );
};
