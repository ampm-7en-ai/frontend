
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIntegrations } from '@/hooks/useIntegrations';
import { TICKETING_PROVIDERS } from '@/hooks/useTicketingIntegrations';
import { CheckCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProviders: string[];
  onAddProvider: (providerId: string) => void;
}

export const IntegrationSelectionModal: React.FC<IntegrationSelectionModalProps> = ({
  open,
  onOpenChange,
  currentProviders,
  onAddProvider
}) => {
  const { integrations, isLoading, forceRefresh } = useIntegrations();
  const { toast } = useToast();
  const [addingProvider, setAddingProvider] = useState<string | null>(null);

  // Refresh data when modal opens
  React.useEffect(() => {
    if (open) {
      forceRefresh();
    }
  }, [open, forceRefresh]);

  // Get available providers (connected ticketing providers not already added to agent)
  const availableProviders = React.useMemo(() => {
    return Object.entries(integrations)
      .filter(([id, integration]) => 
        integration.status === 'connected' && 
        integration.type === 'ticketing' &&
        !currentProviders.includes(id)
      )
      .map(([id, integration]) => ({
        id,
        integration,
        providerInfo: TICKETING_PROVIDERS[id]
      }))
      .filter(item => item.providerInfo); // Only include known providers
  }, [integrations, currentProviders]);

  const handleAddProvider = async (providerId: string) => {
    setAddingProvider(providerId);
    try {
      await onAddProvider(providerId);
      toast({
        title: "Integration added",
        description: `${TICKETING_PROVIDERS[providerId]?.name} has been added to your agent.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add integration",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingProvider(null);
    }
  };

  const getProviderLogo = (providerId: string) => {
    const provider = TICKETING_PROVIDERS[providerId];
    return provider?.logo || `https://img.logo.dev/${providerId}.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true`;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Integration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {availableProviders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No additional integrations available.</p>
              <p className="text-sm mt-1">All connected ticketing providers are already added to this agent.</p>
            </div>
          ) : (
            availableProviders.map(({ id, integration, providerInfo }) => (
              <ModernCard key={id} className="p-4">
                <ModernCardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={getProviderLogo(id)} 
                        alt={`${providerInfo.name} logo`}
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {providerInfo.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      
                      {/* Show connected agents if available */}
                      {(integration as any).agents && (integration as any).agents.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Used by:</span>
                          <div className="flex items-center gap-1">
                            {(integration as any).agents.slice(0, 3).map((agent: any) => (
                              <Avatar key={agent.id} className="w-6 h-6">
                                <AvatarImage src={agent.avatar} />
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                  {agent.name?.charAt(0) || 'A'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {(integration as any).agents.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{(integration as any).agents.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleAddProvider(id)}
                        disabled={addingProvider === id}
                        size="sm"
                        className="h-8"
                      >
                        {addingProvider === id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
