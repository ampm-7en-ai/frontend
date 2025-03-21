
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
        "mb-2 hover:bg-gray-50 transition-all duration-200 cursor-pointer",
        isSelected 
          ? "border-primary/40 bg-blue-50/40 shadow-sm ring-1 ring-primary/10" 
          : "border-gray-100 shadow-sm"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              conversation.status === 'active' ? "bg-emerald-500" : 
              conversation.status === 'pending' ? "bg-amber-400" : "bg-slate-300"
            )} />
            <div>
              <h3 className="font-medium text-gray-800 text-sm">{conversation.customer}</h3>
              <div className="text-xs text-gray-500">{conversation.topic}</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-light">
            {conversation.time}
          </div>
        </div>
        
        <div className="mt-2 text-xs line-clamp-2 text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
          {conversation.lastMessage}
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1 text-gray-400" />
              {conversation.duration}
            </div>
            {conversation.handoffCount > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1 text-gray-400" />
                {conversation.handoffCount}
              </div>
            )}
          </div>
          
          {conversation.agent && (
            <div className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              {conversation.agent}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
