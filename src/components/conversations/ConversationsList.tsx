
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  tags: string[];
  isAgent?: boolean;
}

interface Handoff {
  id: string;
  from: string;
  to: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  customer: string;
  lastMessage: Message;
  status: 'active' | 'closed' | 'unread';
  handoffs?: Handoff[];
}

const ConversationsList = () => {
  const conversations: Conversation[] = [
    {
      id: '1',
      customer: 'John Doe',
      lastMessage: {
        id: 'm1',
        sender: 'John Doe',
        content: 'Hi, I need help with my recent order #12345',
        timestamp: '10:15 AM',
        tags: ['support', 'priority'],
      },
      status: 'active',
      handoffs: [
        {
          id: 'h1',
          from: 'General Bot',
          to: 'Sales Bot',
          timestamp: '10:05 AM',
        }
      ]
    },
    {
      id: '2',
      customer: 'Michael Brown',
      lastMessage: {
        id: 'm15',
        sender: 'Michael Brown',
        content: 'I\'m still experiencing the same issue after talking to 3 different agents',
        timestamp: '11:45 AM',
        tags: ['unresolved', 'urgent', 'multiple-transfers'],
      },
      status: 'active',
      handoffs: [
        {
          id: 'h1',
          from: 'General Bot',
          to: 'Technical Support Bot',
          timestamp: '09:15 AM',
        },
        {
          id: 'h2',
          from: 'Technical Support Bot',
          to: 'Billing Specialist',
          timestamp: '10:20 AM',
        },
        {
          id: 'h3',
          from: 'Billing Specialist',
          to: 'Senior Support Agent',
          timestamp: '11:05 AM',
        }
      ]
    },
    // Add more conversation examples here
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search conversations"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="font-medium">All</Button>
          <Button variant="outline" size="sm">Unread</Button>
          <Button variant="outline" size="sm">Active</Button>
          <Button variant="outline" size="sm">Closed</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-4 border-b hover:bg-accent/5 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{conversation.customer[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{conversation.customer}</span>
                    {conversation.status === 'active' && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                        active
                      </span>
                    )}
                    {conversation.handoffs && conversation.handoffs.length > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded-full flex items-center">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {conversation.handoffs.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {conversation.lastMessage.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conversation.lastMessage.content}
                </p>
                <div className="flex gap-2 mt-2">
                  {conversation.lastMessage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-accent/50 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsList;
