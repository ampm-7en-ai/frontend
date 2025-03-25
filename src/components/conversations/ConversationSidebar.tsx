
import React from 'react';
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
import { ArrowRight, Bot, User, Info, Smile, Clock, Tag, CreditCard } from 'lucide-react';
import HandoffHistory from './HandoffHistory';

interface ConversationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
}

const ConversationSidebar = ({
  open,
  onOpenChange,
  conversation,
  selectedAgent,
  onHandoffClick,
  getSatisfactionIndicator
}: ConversationSidebarProps) => {
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
          
          {/* New Customer Context Section */}
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
              <select className="w-full text-sm border rounded p-1.5">
                <option>Sales Team</option>
                <option>Support Team</option>
                <option>Technical Team</option>
                <option>John Doe (Agent)</option>
                <option>Jane Smith (Agent)</option>
              </select>
              
              <div className="text-xs text-muted-foreground mt-2">Reason</div>
              <select className="w-full text-sm border rounded p-1.5">
                <option>Need specialized knowledge</option>
                <option>Customer request</option>
                <option>Technical escalation</option>
                <option>Follow-up required</option>
              </select>
              
              <Button className="w-full mt-2">
                <ArrowRight className="h-4 w-4 mr-2" />
                Transfer Conversation
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationSidebar;
