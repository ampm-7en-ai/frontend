
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
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
        "mb-2 hover:bg-accent/10 transition-all duration-200 cursor-pointer shadow-sm",
        isSelected ? "border-primary/60 bg-primary/5 shadow-md" : "border-border/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              conversation.status === 'active' ? "bg-green-500" : 
              conversation.status === 'pending' ? "bg-amber-500" : "bg-gray-400"
            )} />
            <div>
              <h3 className="font-medium text-sm">{conversation.customer}</h3>
              <div className="text-xs text-muted-foreground">{conversation.topic}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-light">
            {conversation.time}
          </div>
        </div>
        
        <div className="mt-2 text-xs line-clamp-2 text-muted-foreground/90 bg-background/80 p-2 rounded-md border border-border/20">
          {conversation.lastMessage}
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 opacity-70" />
              {conversation.duration}
            </div>
            {conversation.handoffCount > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1 opacity-70" />
                {conversation.handoffCount}
              </div>
            )}
          </div>
          
          {conversation.agent && (
            <div className="text-xs px-2 py-0.5 bg-primary/5 text-primary-foreground rounded-full border border-primary/10">
              {conversation.agent}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
