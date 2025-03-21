
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  RefreshCw, 
  Instagram, 
  Slack, 
  MessageSquare, 
  Mail, 
  Phone, 
  Check, 
  X 
} from 'lucide-react';
import HandoffHistory from './HandoffHistory';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  reason?: string;
}

interface Conversation {
  id: string;
  customer: string;
  lastMessage: Message;
  status: 'resolved' | 'unresolved';
  channel: 'whatsapp' | 'slack' | 'instagram' | 'freshdesk' | 'phone';
  handoffs?: Handoff[];
}

const ConversationsList = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  
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
      status: 'unresolved',
      channel: 'whatsapp',
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
      status: 'unresolved',
      channel: 'freshdesk',
      handoffs: [
        {
          id: 'h1',
          from: 'General Bot',
          to: 'Technical Support Bot',
          timestamp: '09:15 AM',
          reason: 'Technical expertise needed'
        },
        {
          id: 'h2',
          from: 'Technical Support Bot',
          to: 'Billing Specialist',
          timestamp: '10:20 AM',
          reason: 'Billing issue identified'
        },
        {
          id: 'h3',
          from: 'Billing Specialist',
          to: 'Senior Support Agent',
          timestamp: '11:05 AM',
          reason: 'Escalation required'
        }
      ]
    },
    {
      id: '3',
      customer: 'Sarah Johnson',
      lastMessage: {
        id: 'm3',
        sender: 'Sarah Johnson',
        content: 'When will the new product be available in my region?',
        timestamp: '9:30 AM',
        tags: ['sales', 'product-inquiry'],
      },
      status: 'unresolved',
      channel: 'instagram',
      handoffs: []
    },
    {
      id: '4',
      customer: 'Robert Chen',
      lastMessage: {
        id: 'm4',
        sender: 'Support Bot',
        content: 'Is there anything else I can help you with today?',
        timestamp: 'Yesterday',
        tags: ['feedback'],
        isAgent: true
      },
      status: 'resolved',
      channel: 'slack',
      handoffs: []
    },
    {
      id: '5',
      customer: 'Emma Williams',
      lastMessage: {
        id: 'm5',
        sender: 'Emma Williams',
        content: 'Thank you for resolving my payment issue so quickly.',
        timestamp: '2 days ago',
        tags: ['billing', 'resolved'],
      },
      status: 'resolved',
      channel: 'phone',
      handoffs: []
    }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return <Instagram className="h-3 w-3" />;
      case 'slack':
        return <Slack className="h-3 w-3" />;
      case 'whatsapp':
        return <MessageSquare className="h-3 w-3" />;
      case 'freshdesk':
        return <Mail className="h-3 w-3" />;
      case 'phone':
        return <Phone className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'slack':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'whatsapp':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'freshdesk':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'phone':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleHandoffClick = (handoff: Handoff) => {
    toast({
      title: `Viewing messages from ${handoff.from}`,
      description: "Navigation to full conversation view required to see complete history.",
    });
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesStatus = statusFilter === 'all' || conversation.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || conversation.channel === channelFilter;
    return matchesStatus && matchesChannel;
  });

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
          <Button 
            variant={statusFilter === 'all' ? "default" : "outline"} 
            size="sm" 
            className="font-medium"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'unresolved' ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter('unresolved')}
            className="flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Unresolved
          </Button>
          <Button 
            variant={statusFilter === 'resolved' ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter('resolved')}
            className="flex items-center gap-1"
          >
            <Check className="h-3.5 w-3.5" />
            Resolved
          </Button>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Button 
            variant={channelFilter === 'all' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setChannelFilter('all')}
            className="h-7"
          >
            All Channels
          </Button>
          <Button 
            variant={channelFilter === 'whatsapp' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setChannelFilter('whatsapp')}
            className="flex items-center gap-1 h-7"
          >
            <MessageSquare className="h-3 w-3" />
            WhatsApp
          </Button>
          <Button 
            variant={channelFilter === 'slack' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setChannelFilter('slack')}
            className="flex items-center gap-1 h-7"
          >
            <Slack className="h-3 w-3" />
            Slack
          </Button>
          <Button 
            variant={channelFilter === 'instagram' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setChannelFilter('instagram')}
            className="flex items-center gap-1 h-7"
          >
            <Instagram className="h-3 w-3" />
            Instagram
          </Button>
          <Button 
            variant={channelFilter === 'freshdesk' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setChannelFilter('freshdesk')}
            className="flex items-center gap-1 h-7"
          >
            <Mail className="h-3 w-3" />
            Freshdesk
          </Button>
          <Button 
            variant={channelFilter === 'phone' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setChannelFilter('phone')}
            className="flex items-center gap-1 h-7"
          >
            <Phone className="h-3 w-3" />
            Phone
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
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
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full flex items-center gap-1",
                      conversation.status === 'resolved' 
                        ? "bg-green-100 text-green-800 border border-green-200" 
                        : "bg-red-100 text-red-800 border border-red-200"
                    )}>
                      {conversation.status === 'resolved' 
                        ? <Check className="h-3 w-3" /> 
                        : <X className="h-3 w-3" />
                      }
                      {conversation.status}
                    </span>
                    
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full flex items-center gap-1 border",
                      getChannelColor(conversation.channel)
                    )}>
                      {getChannelIcon(conversation.channel)}
                      {conversation.channel}
                    </span>
                    
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
                {conversation.handoffs && conversation.handoffs.length > 1 && (
                  <div className="mt-2">
                    <HandoffHistory 
                      handoffs={conversation.handoffs} 
                      compact={true} 
                      onHandoffClick={handleHandoffClick}
                    />
                  </div>
                )}
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
