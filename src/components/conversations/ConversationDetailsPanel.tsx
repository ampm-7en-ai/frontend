import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, HelpCircle, Info, Ticket, User, Smile, Clock, Tag, CreditCard, CheckCircle } from 'lucide-react';
import HandoffHistory from './HandoffHistory';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';

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
  const [ticketPriority, setTicketPriority] = useState('2'); // Default to medium (2)
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketProvider, setTicketProvider] = useState('freshdesk'); // Default to freshdesk
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();
  const { getToken } = useAuth();

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

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingTicket(true);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const payload = {
        session_id: conversation.id,
        subject: ticketSubject,
        description: ticketDescription,
        priority: parseInt(ticketPriority),
        provider: ticketProvider
      };

      const response = await fetch(`${BASE_URL}chat/tickets/create/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const result = await response.json();
      
      // Show success state
      setTicketCreated(true);
      setSuccessMessage(result.message || 'Ticket created successfully!');
      
      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });

    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleOpenDialog = () => {
    console.log('Opening dialog');
    setShowTicketDialog(true);
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog');
    setShowTicketDialog(false);
    setTicketCreated(false);
    setTicketSubject('');
    setTicketDescription('');
    setTicketPriority('2');
    setTicketProvider('freshdesk');
    setSuccessMessage('');
  };

  // Helper function to get sentiment score as a percentage
  const getSentimentScore = (sentiment: string) => {
    switch (sentiment) {
      case 'frustrated': return 10;
      case 'dissatisfied': return 30;
      case 'neutral': return 50;
      case 'satisfied': return 75;
      case 'delighted': return 95;
      default: return 50; // Default to neutral
    }
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
      
      {/* Customer Context Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Customer Context
        </h3>
        
        <div className="space-y-4 bg-slate-50 rounded-lg p-3">
          {/* Account Status */}
          <div>
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <CreditCard className="h-3.5 w-3.5 mr-1" />
              Account Status
            </div>
            <Badge className="bg-purple-600 hover:bg-purple-700">Premium Account</Badge>
          </div>
          
          {/* Previous Interactions */}
          <div>
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Previous Interactions
            </div>
            <div className="text-sm">
              {conversation.previousInteractions || "3 conversations in the last 30 days"}
            </div>
          </div>
          
          {/* Detected Topics */}
          <div>
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <Tag className="h-3.5 w-3.5 mr-1" />
              Detected Topics
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="bg-white">Account Setup</Badge>
              <Badge variant="outline" className="bg-white">Email Verification</Badge>
              <Badge variant="outline" className="bg-white">New User</Badge>
            </div>
          </div>
          
          {/* Customer Sentiment */}
          <div>
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <Smile className="h-3.5 w-3.5 mr-1" />
              Customer Sentiment
            </div>
            <div className="w-full">
              <Progress 
                value={getSentimentScore(conversation.satisfaction)} 
                className="h-2 mb-1" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Frustrated</span>
                <span>Neutral</span>
                <span>Satisfied</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Create Ticket Button and Dialog */}
      <div className="pt-2">
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={handleOpenDialog}>
              <Ticket className="h-4 w-4 mr-2" />
              Create Support Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Create a new support ticket for this conversation.
              </DialogDescription>
            </DialogHeader>
            
            {!ticketCreated ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider *</label>
                  <RadioGroup value={ticketProvider} onValueChange={setTicketProvider} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="freshdesk" id="freshdesk" />
                      <Label htmlFor="freshdesk">Freshdesk</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="zendesk" id="zendesk" />
                      <Label htmlFor="zendesk">Zendesk</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <input
                    className="w-full text-sm border rounded p-2"
                    placeholder="Ticket subject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={ticketPriority} onValueChange={setTicketPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">High</SelectItem>
                      <SelectItem value="4">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    className="w-full text-sm border rounded p-2 min-h-[100px]"
                    placeholder="Ticket description"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTicket} 
                    disabled={!ticketSubject.trim() || !ticketDescription.trim() || isCreatingTicket}
                  >
                    {isCreatingTicket ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4 mr-2" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600">Ticket Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground mt-2">{successMessage}</p>
                </div>
                <Button onClick={handleCloseDialog} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConversationDetailsPanel;
