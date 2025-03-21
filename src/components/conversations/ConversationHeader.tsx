
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Clock, Info, X } from 'lucide-react';

interface ConversationHeaderProps {
  conversation: any;
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ConversationHeader = ({ 
  conversation, 
  selectedAgent, 
  setSelectedAgent, 
  onInfoClick,
  getStatusBadge 
}: ConversationHeaderProps) => {
  return (
    <div className="border-b p-3 flex justify-between items-center">
      <div className="flex items-center">
        <h2 className="text-base font-semibold">{conversation.customer}</h2>
        <div className="ml-2">{getStatusBadge(conversation.status)}</div>
      </div>
      <div className="flex items-center gap-2">
        {selectedAgent && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 border-primary/30 text-primary"
          >
            <Bot className="h-3 w-3" />
            Viewing: {selectedAgent}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(null);
              }}
            />
          </Badge>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {conversation.duration}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onInfoClick}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
