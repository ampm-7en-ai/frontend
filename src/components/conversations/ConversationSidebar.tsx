
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Bot, User } from 'lucide-react';
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
