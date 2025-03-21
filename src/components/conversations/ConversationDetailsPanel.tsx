
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, HelpCircle, Info, Tag, User } from 'lucide-react';
import HandoffHistory from './HandoffHistory';

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
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Tag className="h-4 w-4 mr-1" />
          Topic Classification
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm">Account Setup</div>
            <Badge variant="outline" className="text-xs">95%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm">Email Verification</div>
            <Badge variant="outline" className="text-xs">88%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm">Technical Support</div>
            <Badge variant="outline" className="text-xs">45%</Badge>
          </div>
          
          <Button variant="outline" size="sm" className="w-full mt-2">
            <HelpCircle className="h-4 w-4 mr-2" />
            Adjust Topics
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Knowledge Insights
        </h3>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
          <div className="font-medium text-amber-800">Potential Knowledge Gaps</div>
          <ul className="list-disc pl-4 mt-1 text-amber-700 space-y-1">
            <li>Detailed verification process</li>
            <li>Account recovery options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailsPanel;
