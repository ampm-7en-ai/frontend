
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Bot, User, Info, Smile, Clock, Tag, CreditCard, AlertTriangle } from 'lucide-react';
import HandoffHistory from './HandoffHistory';
import { useToast } from '@/hooks/use-toast';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

interface ConversationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
}

const handoffDestinationOptions = [
  { value: 'Sales Team', label: 'Sales Team' },
  { value: 'Support Team', label: 'Support Team' },
  { value: 'Technical Team', label: 'Technical Team' },
  { value: 'John Doe (Agent)', label: 'John Doe (Agent)' },
  { value: 'Jane Smith (Agent)', label: 'Jane Smith (Agent)' },
];

const handoffReasonOptions = [
  { value: 'Need specialized knowledge', label: 'Need specialized knowledge' },
  { value: 'Customer request', label: 'Customer request' },
  { value: 'Technical escalation', label: 'Technical escalation' },
  { value: 'Follow-up required', label: 'Follow-up required' },
];

const ConversationSidebar = ({
  open,
  onOpenChange,
  conversation,
  selectedAgent,
  onHandoffClick,
  getSatisfactionIndicator
}: ConversationSidebarProps) => {
  // Add state for handoff functionality
  const [handoffDestination, setHandoffDestination] = useState('');
  const [handoffReason, setHandoffReason] = useState('');
  const { toast } = useToast();

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

  // Handle the handoff process
  const handleHandoff = () => {
    if (!handoffDestination) {
      toast({
        title: "Error",
        description: "Please select a destination for the handoff",
        variant: "destructive",
      });
      return;
    }

    // Create a simple handoff record for the onHandoffClick handler
    const handoff = {
      id: `handoff-${Date.now()}`,
      from: conversation.agent || 'Current Agent',
      to: handoffDestination,
      timestamp: new Date().toISOString(),
      reason: handoffReason || `Transferred to ${handoffDestination}`
    };

    // Call the parent handler
    if (onHandoffClick) {
      onHandoffClick(handoff);
    }

    // Show success message
    toast({
      title: "Handoff initiated",
      description: `Conversation transferred to ${handoffDestination}`,
    });

    // Reset the form
    setHandoffDestination('');
    setHandoffReason('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[350px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Conversation Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
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
          
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 mr-1" />
              Handoff Controls
            </h3>
            
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Transfer to</div>
              <ModernDropdown
                value={handoffDestination}
                onValueChange={setHandoffDestination}
                options={handoffDestinationOptions}
                placeholder="Select a destination"
              />
              
              <div className="text-xs text-muted-foreground mt-2">Reason</div>
              <ModernDropdown
                value={handoffReason}
                onValueChange={setHandoffReason}
                options={handoffReasonOptions}
                placeholder="Select a reason"
              />
              
              <Button 
                className="w-full mt-2"
                onClick={handleHandoff}
                disabled={!handoffDestination}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Transfer Conversation
              </Button>
              
              {!handoffDestination && (
                <div className="mt-1 flex items-center text-amber-600 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Please select a destination
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationSidebar;
