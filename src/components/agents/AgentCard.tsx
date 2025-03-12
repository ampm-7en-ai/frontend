
import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import AgentActionsDropdown from './AgentActionsDropdown';
import AgentModelBadge from './AgentModelBadge';
import AgentKnowledgeSection from './AgentKnowledgeSection';
import AgentFooterActions from './AgentFooterActions';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    conversations: number;
    lastModified: string;
    averageRating: number;
    knowledgeSources: Array<{
      id: number;
      name: string;
      type: string;
      icon: string;
      hasError: boolean;
    }>;
    model: string;
    isDeployed: boolean;
  };
  getModelBadgeColor: (model: string) => string;
}

const AgentCard = ({ agent, getModelBadgeColor }: AgentCardProps) => {
  return (
    <Card key={agent.id} className="overflow-hidden border flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot size={18} className="text-primary" />
              </div>
              {agent.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </div>
          <AgentActionsDropdown agentId={agent.id} />
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="space-y-4">
          <div>
            <AgentModelBadge model={agent.model} getModelBadgeColor={getModelBadgeColor} />
          </div>
          
          <AgentKnowledgeSection 
            agentId={agent.id} 
            knowledgeSources={agent.knowledgeSources} 
          />
          
          <div className="text-sm flex items-center justify-between text-muted-foreground">
            <div>
              <span className="font-medium">{agent.conversations.toLocaleString()}</span> conversations
            </div>
            <div>
              Last updated: {new Date(agent.lastModified).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 p-4 pt-2 mt-2 border-t bg-muted/30">
        <AgentFooterActions agent={agent} />
      </CardFooter>
    </Card>
  );
};

export default AgentCard;
