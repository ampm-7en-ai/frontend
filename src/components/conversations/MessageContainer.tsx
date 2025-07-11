
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info, Send, Plus, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useFloatingToast } from '@/context/FloatingToastContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateSupportTicketModal from './CreateSupportTicketModal';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAgent?: boolean;
  agent?: string;
  type?: string;
  from?: string;
  to?: string;
  reason?: string;
}

interface Conversation {
  id: string;
  customer: string;
  messages: Message[];
}

interface MessageContainerProps {
  conversation: Conversation | null;
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  onSendMessage?: (message: string) => void;
}

const MessageContainer = ({
  conversation,
  selectedAgent,
  setSelectedAgent,
  onInfoClick,
  getStatusBadge,
  onSendMessage
}: MessageContainerProps) => {
  const { showToast } = useFloatingToast();
  const [message, setMessage] = useState('');
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on component mount and when messages change
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !conversation) return;
    
    // Add your message sending logic here
    console.log('Sending message:', message);
    
    onSendMessage?.(message);
    setMessage('');
    
    // Scroll to bottom after sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCreateTicket = () => {
    setIsCreateTicketOpen(true);
  };

  const handleTicketCreated = (ticketData: any) => {
    showToast({
      title: "Support ticket created",
      description: `Ticket #${ticketData.id} has been created successfully.`,
      variant: "success"
    });
    setIsCreateTicketOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{conversation?.customer[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{conversation?.customer}</div>
            <div className="text-sm text-muted-foreground">
              {getStatusBadge(conversation?.id || '')}
            </div>
          </div>
        </div>
        <div>
          <Button variant="ghost" size="icon" onClick={onInfoClick}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <MessageList 
              conversation={conversation} 
              selectedAgent={selectedAgent}
            />
            <div ref={messagesEndRef} /> {/* Invisible element to mark the bottom */}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <MessageInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateTicket}>
                Create Support Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CreateSupportTicketModal
        open={isCreateTicketOpen}
        onOpenChange={setIsCreateTicketOpen}
        onCreate={handleTicketCreated}
      />
    </div>
  );
};

export default MessageContainer;
