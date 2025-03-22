
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, HelpCircle, Info, Ticket, User } from 'lucide-react';
import HandoffHistory from './HandoffHistory';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConversationDetailsPanelProps {
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
}

const ConversationDetailsPanel = ({
  conversation,
  selectedAgent,
  onHandoffClick,
  getSatisfactionIndicator
}: ConversationDetailsPanelProps) => {
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketDescription, setTicketDescription] = useState('');

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        <div className="text-center">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Select a conversation to view details</p>
        </div>
      </div>
    );
  }

  const handleCreateTicket = () => {
    // Implement ticket creation functionality here
    alert(`Creating ticket: ${ticketSubject} (${ticketPriority} priority)`);
    setShowTicketDialog(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Bot className="h-4 w-4 mr-1" />
          Current Agent
        </h3>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-primary">
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{conversation.agent}</div>
              <div className="text-xs text-muted-foreground">AI Assistant</div>
            </div>
          </div>
        </div>
        
        {conversation.handoffCount > 0 && (
          <div className="mt-4">
            <HandoffHistory 
              handoffs={conversation.messages
                .filter((msg: any) => msg.type === 'transfer')
                .map((transfer: any) => ({
                  id: transfer.id,
                  from: transfer.from,
                  to: transfer.to,
                  timestamp: transfer.timestamp,
                  reason: transfer.reason
                }))}
              onHandoffClick={onHandoffClick}
            />
          </div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <User className="h-4 w-4 mr-1" />
          Customer Information
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">Full Name</div>
            <div className="text-sm">{conversation.customer}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="text-sm">{conversation.email}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Satisfaction</div>
            <div className="text-sm">{getSatisfactionIndicator(conversation.satisfaction)}</div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Create Ticket Button and Dialog */}
      <div className="pt-2">
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Ticket className="h-4 w-4 mr-2" />
              Create Support Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Freshdesk Ticket</DialogTitle>
              <DialogDescription>
                Create a new support ticket in Freshdesk for this conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input
                  className="w-full text-sm border rounded p-2"
                  placeholder="Ticket subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="w-full text-sm border rounded p-1.5"
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full text-sm border rounded p-2 min-h-[100px]"
                  placeholder="Ticket description"
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTicketDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={!ticketSubject}>
                <Ticket className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConversationDetailsPanel;
