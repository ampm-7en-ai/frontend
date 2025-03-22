
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  Clock, 
  Info, 
  X, 
  Phone, 
  Mail, 
  Slack, 
  MessageSquare, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConversationHeaderProps {
  conversation: any;
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ConversationHeader = ({ 
  conversation, 
  selectedAgent, 
  setSelectedAgent, 
  onInfoClick,
  getStatusBadge 
}: ConversationHeaderProps) => {
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [handoffReason, setHandoffReason] = useState('');

  // Get channel icon with brand-appropriate colors
  const getChannelIcon = () => {
    switch (conversation.channel?.toLowerCase()) {
      case 'email':
        return (
          <div className="bg-blue-600 w-full h-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'phone':
        return (
          <div className="bg-green-600 w-full h-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'slack':
        return (
          <div className="bg-purple-700 w-full h-full flex items-center justify-center">
            <Slack className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'instagram':
        return (
          <div className="bg-pink-600 w-full h-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      default:
        return (
          <div className="bg-gray-600 w-full h-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
    }
  };

  const handleResolveConversation = () => {
    // Implement resolve functionality here
    alert('Conversation marked as resolved');
  };

  const handleHandoff = () => {
    // Implement handoff functionality here
    alert(`Transferring to ${selectedTeam}: ${handoffReason}`);
    setShowHandoffDialog(false);
  };

  return (
    <div className="border-b p-3 flex justify-between items-center bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 rounded-none overflow-hidden">
          {getChannelIcon()}
        </Avatar>
        <div>
          <div className="flex items-center">
            <h2 className="text-base font-semibold">{conversation.customer}</h2>
            <div className="ml-2">{getStatusBadge(conversation.status)}</div>
          </div>
          <div className="text-xs text-muted-foreground">{conversation.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {selectedAgent && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 border-primary/30 text-primary"
          >
            <Bot className="h-3 w-3" />
            Viewing: {selectedAgent}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(null);
              }}
            />
          </Badge>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {conversation.duration}
        </div>
        
        {/* Handoff Dialog */}
        <Dialog open={showHandoffDialog} onOpenChange={setShowHandoffDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4" />
              Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Conversation</DialogTitle>
              <DialogDescription>
                Select a team or agent to transfer this conversation to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Transfer to</label>
                <select 
                  className="w-full text-sm border rounded p-1.5"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">Select team or agent</option>
                  <option value="Sales Team">Sales Team</option>
                  <option value="Support Team">Support Team</option>
                  <option value="Technical Team">Technical Team</option>
                  <option value="John Doe">John Doe (Agent)</option>
                  <option value="Jane Smith">Jane Smith (Agent)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <select 
                  className="w-full text-sm border rounded p-1.5"
                  value={handoffReason}
                  onChange={(e) => setHandoffReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="Need specialized knowledge">Need specialized knowledge</option>
                  <option value="Customer request">Customer request</option>
                  <option value="Technical escalation">Technical escalation</option>
                  <option value="Follow-up required">Follow-up required</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowHandoffDialog(false)}>Cancel</Button>
              <Button onClick={handleHandoff} disabled={!selectedTeam || !handoffReason}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resolve Button */}
        <Button
          variant="outline" 
          size="sm"
          className="h-8 rounded-md flex items-center gap-1"
          onClick={handleResolveConversation}
        >
          <CheckCircle className="h-4 w-4" />
          Resolve
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onInfoClick}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
