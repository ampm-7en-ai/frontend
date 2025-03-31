import React, { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Bot, User, MessageSquare, AlertCircle } from 'lucide-react';

export interface ConversationsListProps {
  conversations: any[]; // Array of conversation objects
}

const ConversationsList: FC<ConversationsListProps> = ({ conversations }) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No conversations found</h3>
        <p className="text-muted-foreground mt-2">
          Start a new conversation with one of your agents or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Card 
          key={conversation.id} 
          className="hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 mt-1">
                {conversation.agentAvatar ? (
                  <AvatarImage src={conversation.agentAvatar} alt={conversation.agentName} />
                ) : (
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{conversation.agentName || 'Unnamed Agent'}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {conversation.lastMessage}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                    {conversation.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                  
                  {conversation.channel && (
                    <Badge variant="outline" className="text-xs">
                      {conversation.channel}
                    </Badge>
                  )}
                  
                  {conversation.hasError && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </Badge>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {conversation.userName || 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConversationsList;
