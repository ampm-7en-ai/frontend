
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  customer: string;
  email: string;
  lastMessage: string;
  time: string;
  status: 'active' | 'pending' | 'closed';
  agent: string;
  satisfaction: 'high' | 'medium' | 'low';
  priority: 'high' | 'normal' | 'low';
  duration: string;
  handoffCount: number;
  topic: string;
  messages: any[];
}

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationCard = ({ 
  conversation, 
  isSelected, 
  onClick
}: ConversationCardProps) => {
  return (
    <Card 
      className={cn(
        "mb-2 hover:bg-accent/5 transition-colors cursor-pointer",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              conversation.status === 'active' ? "bg-green-500" : 
              conversation.status === 'pending' ? "bg-amber-500" : "bg-gray-500"
            )} />
            <div>
              <h3 className="font-medium text-sm">{conversation.customer}</h3>
              <div className="text-xs text-muted-foreground">{conversation.topic}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {conversation.time}
          </div>
        </div>
        <div className="mt-1 text-xs line-clamp-1 text-muted-foreground">
          {conversation.lastMessage}
        </div>
        <div className="mt-1 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {conversation.duration}
            </div>
            {conversation.handoffCount > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {conversation.handoffCount}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
