
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
import ConversationDetailsPanel from './ConversationDetailsPanel';
import { useToast } from '@/hooks/use-toast';
import { useConversationUtils } from '@/hooks/useConversationUtils';

interface ConversationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
  sentimentData: {
    sentimentScores: Array<{
      messageId: string;
      content: string;
      score: number;
      timestamp: string;
    }>;
    averageSentiment: number | null;
  };
}

const ConversationSidebar = ({
  open,
  onOpenChange,
  conversation,
  selectedAgent,
  onHandoffClick,
  getSatisfactionIndicator,
  sentimentData
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
      <SheetContent side="right" className="w-[350px] sm:w-[450px] p-0">
        <ConversationDetailsPanel
          conversation={conversation}
          selectedAgent={selectedAgent}
          onHandoffClick={onHandoffClick}
          getSatisfactionIndicator={getSatisfactionIndicator}
          sentimentData={sentimentData}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ConversationSidebar;
