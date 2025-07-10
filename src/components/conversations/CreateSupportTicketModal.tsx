
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
import { Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { useTicketingIntegrations } from '@/hooks/useTicketingIntegrations';
import { createTicket } from '@/services/ticketingServices';

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
  const [priority, setPriority] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const { toast } = useToast();
  
  const { 
    connectedProviders, 
    isLoading: isLoadingProviders, 
    error: providersError,
    hasConnectedProviders 
  } = useTicketingIntegrations();

  // Pre-populate fields based on conversation data
  React.useEffect(() => {
    if (conversation && open) {
      setSubject(`Support request from ${conversation.customer || 'Customer'}`);
      setContent(`Customer: ${conversation.customer || 'N/A'}\nEmail: ${conversation.email || 'N/A'}\n\nConversation context: Support needed for ongoing conversation #${conversation.id}`);
    }
  }, [conversation, open]);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setSubject('');
      setContent('');
      setPriority('');
      setSelectedProvider('');
    }
  }, [open]);

  // Set default provider and priority when providers load
  React.useEffect(() => {
    if (connectedProviders.length > 0 && !selectedProvider) {
      const defaultProvider = connectedProviders[0];
      setSelectedProvider(defaultProvider.id);
      setPriority(defaultProvider.capabilities.priorities[1] || defaultProvider.capabilities.priorities[0]);
    }
  }, [connectedProviders, selectedProvider]);

  const selectedProviderData = connectedProviders.find(p => p.id === selectedProvider);

  const handleCreateTicket = async () => {
    if (!selectedProvider) {
      toast({
        title: "Provider Required",
        description: "Please select a ticketing provider.",
        variant: "destructive"
      });
      return;
    }

    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and content are required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!priority) {
      toast({
        title: "Priority Required",
        description: "Please select a priority level.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createTicket(selectedProvider, {
        subject,
        content,
        priority,
        conversation
      });

      if (result.success) {
        toast({
          title: "Ticket Created Successfully",
          description: result.message,
        });
        
        // Reset form and close modal
        setSubject('');
        setContent('');
        setPriority('');
        setSelectedProvider('');
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
    setPriority('');
    setSelectedProvider('');
    onOpenChange(false);
  };

  if (isLoadingProviders) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading ticketing providers...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (providersError || !hasConnectedProviders) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              No Connected Providers
            </DialogTitle>
            <DialogDescription>
              {providersError 
                ? `Error loading providers: ${providersError}`
                : "No ticketing providers are currently connected. Please connect a provider first."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-600" />
            Create Support Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new support ticket using your connected ticketing provider.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Ticketing Provider *</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue placeholder="Select a ticketing provider" />
              </SelectTrigger>
              <SelectContent>
                {connectedProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <span>{provider.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="priority">Priority *</Label>
            <Select value={priority} onValueChange={setPriority} disabled={isCreating || !selectedProviderData}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {selectedProviderData?.capabilities.priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
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

          {selectedProviderData && (
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Ticket className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Provider:</strong> Ticket will be created in {selectedProviderData.name}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateTicket} disabled={isCreating || !selectedProvider}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Ticket"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupportTicketModal;
