
import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import ModernButton from '@/components/dashboard/ModernButton';
import { useToast } from '@/hooks/use-toast';
import { Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { useTicketingIntegrations } from '@/hooks/useTicketingIntegrations';
import { createTicket } from '@/services/ticketingServices';

interface CreateSupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation?: any;
  onTicketCreated?: (updatedConversation: any) => void;
}

const CreateSupportTicketModal = ({
  open,
  onOpenChange,
  conversation,
  onTicketCreated
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
        
        // Update conversation to reflect ticket creation
        if (onTicketCreated && conversation) {
          const updatedConversation = {
            ...conversation,
            agentType: 'human',
            agent: 'Support Team',
            channel: 'ticketing'
          };
          onTicketCreated(updatedConversation);
        }
        
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
      <ModernModal 
        open={open} 
        onOpenChange={onOpenChange}
        title="Loading..."
        size="md"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading ticketing providers...</span>
        </div>
      </ModernModal>
    );
  }

  if (providersError || !hasConnectedProviders) {
    return (
      <ModernModal 
        open={open} 
        onOpenChange={onOpenChange}
        title="No Connected Providers"
        size="md"
        footer={
          <ModernButton onClick={() => onOpenChange(false)}>
            Close
          </ModernButton>
        }
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {providersError 
              ? `Error loading providers: ${providersError}`
              : "No ticketing providers are currently connected. Please connect a provider first."
            }
          </div>
        </div>
      </ModernModal>
    );
  }

  // Prepare dropdown options with logos
  const providerOptions = connectedProviders.map(provider => ({
    value: provider.id,
    label: provider.name,
    description: `${provider.type} provider`,
    logo: provider.logo
  }));

  const priorityOptions = selectedProviderData?.capabilities.priorities.map(p => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
  })) || [];

  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Support Ticket"
      description="Create a new support ticket using your connected ticketing provider."
      size="lg"
      footer={
        <div className="flex gap-3">
          <ModernButton 
            variant="outline" 
            onClick={handleCancel} 
            disabled={isCreating}
          >
            Cancel
          </ModernButton>
          <ModernButton 
            variant="primary"
            onClick={handleCreateTicket} 
            disabled={isCreating || !selectedProvider}
            icon={isCreating ? Loader2 : undefined}
          >
            {isCreating ? "Creating..." : "Create Ticket"}
          </ModernButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ticket Details</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Ticketing Provider *</Label>
            <ModernDropdown
              value={selectedProvider}
              onValueChange={setSelectedProvider}
              options={providerOptions}
              placeholder="Select a ticketing provider"
              disabled={isCreating}
              renderOption={(option) => (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {option.logo && (
                      <img 
                        src={option.logo} 
                        alt={`${option.label} logo`}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {option.value === selectedProvider && (
                    <div className="h-4 w-4 text-blue-600 dark:text-blue-400">✓</div>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter ticket subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isCreating}
              className="rounded-xl"
            />
          </div>
          
          {/* <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <ModernDropdown
              value={priority}
              onValueChange={setPriority}
              options={priorityOptions}
              placeholder="Select priority"
              disabled={isCreating || !selectedProviderData}
            />
          </div> */}
          
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Describe the issue or request..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl"
              disabled={isCreating}
            />
          </div>
        </div>
      </div>
    </ModernModal>
  );
};

export default CreateSupportTicketModal;
