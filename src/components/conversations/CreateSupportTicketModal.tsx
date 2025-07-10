
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAccessToken, getApiUrl } from '@/utils/api-config';
import { Ticket, AlertCircle } from 'lucide-react';

interface CreateSupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation?: any;
}

const CreateSupportTicketModal = ({
  open,
  onOpenChange,
  conversation
}: CreateSupportTicketModalProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const { toast } = useToast();

  // Pre-populate fields based on conversation data
  React.useEffect(() => {
    if (conversation && open) {
      setSubject(`Support request from ${conversation.customer || 'Customer'}`);
      setContent(`Customer: ${conversation.customer || 'N/A'}\nEmail: ${conversation.email || 'N/A'}\n\nConversation context: Support needed for ongoing conversation #${conversation.id}`);
    }
  }, [conversation, open]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and content are required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const payload = {
        ticket_data: {
          properties: {
            subject: subject,
            content: content,
            hs_ticket_priority: priority
          }
        }
      };

      const response = await fetch(getApiUrl('hubspot/ticket/create/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to create ticket: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        toast({
          title: "Ticket Created Successfully",
          description: `Support ticket #${result.data.ticket_id} has been created in HubSpot.`,
        });
        
        // Reset form and close modal
        setSubject('');
        setContent('');
        setPriority('MEDIUM');
        onOpenChange(false);
      } else {
        throw new Error(result.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Ticket Creation Failed",
        description: error instanceof Error ? error.message : "Unable to create support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setSubject('');
    setContent('');
    setPriority('MEDIUM');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-600" />
            Create Support Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new support ticket in HubSpot for this conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter ticket subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Describe the issue or request..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isCreating}
            />
          </div>
          
          {conversation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Auto-populated:</strong> This ticket will include context from the current conversation with {conversation.customer}.
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateTicket} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupportTicketModal;
