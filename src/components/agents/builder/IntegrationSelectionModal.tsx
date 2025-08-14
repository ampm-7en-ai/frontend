
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIntegrations } from '@/hooks/useIntegrations';
import { CheckCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModernButton from '@/components/dashboard/ModernButton';

interface IntegrationSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProviders: string[];
  onAddProvider: (providerId: string) => void;
  isAdding: boolean;
}

const integrationsList = {
      "whatsapp" : {
        name: 'WhatsApp Business',
        logo: 'https://img.logo.dev/whatsapp.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      },
      "messenger" : {
        name: 'Facebook Messenger',
        logo: 'https://img.logo.dev/facebook.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
      },
      "slack": {
        name: 'Slack',
        logo: 'https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
      },
      "instagram":{
        name: 'Instagram',
        logo: 'https://img.logo.dev/instagram.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
      },
      "zapier": {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      logo: 'https://img.logo.dev/zapier.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Automation',
      type: 'automation'
    },
    "zendesk":{
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Support',
      type: 'ticketing'
    },
    "freshdesk": {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/freshdesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Support',
      type: 'ticketing'
    },
    "zogo":{
      id: 'zoho',
      name: 'Zoho Desk',
      description: 'Connect your AI Agent with Zoho Desk to streamline customer support and ticket handling.',
      logo: 'https://img.logo.dev/zoho.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Support',
      type: 'ticketing'
    },
    "salesforce":{
      id: 'salesforce',
      name: 'Salesforce Service Cloud',
      description: 'Connect your AI Agent with Salesforce to enhance customer service and case management.',
      logo: 'https://img.logo.dev/salesforce.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'CRM & Support',
      type: 'ticketing'
    },
    "hubspot":{
      id: 'hubspot',
      name: 'HubSpot Service Hub',
      description: 'Connect your AI Agent with HubSpot to automate customer support and ticketing workflows.',
      logo: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'CRM & Support',
      type: 'ticketing'
    },
    "google_drive": {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Connect your AI Agent with Google Drive to access and manage your documents and files.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
      category: 'Storage',
      type: 'storage'
    }
  };

export const IntegrationSelectionModal: React.FC<IntegrationSelectionModalProps> = ({
  open,
  onOpenChange,
  currentProviders,
  onAddProvider,
  isAdding
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
        providerInfo: integrationsList[id]
      }))
      .filter(item => item.providerInfo); // Only include known providers
  }, [integrations, currentProviders]);

  const handleAddProvider = async (providerId: string) => {
    setAddingProvider(providerId);
    try {
      await onAddProvider(providerId);
      toast({
        title: "Integration added",
        description: `${integrationsList[providerId]?.name} has been added to your agent.`,
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
    const provider = integrationsList[providerId];
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
                        className="w-10 h-10 rounded-2xl object-contain bg-white p-1"
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
                      </div>
                      
                      {/* Show connected agents if available */}
                      {(integration as any).agents && (integration as any).agents.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Used by:</span>
                          <div className="flex items-center gap-1">
                            {(integration as any).agents.slice(0, 3).map((agent: any) => (
                              <Avatar key={agent.id} className="w-6 h-6 rounded-2xl">
                                <AvatarImage src={agent.avatar}/>
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
                      <ModernButton
                        onClick={() => handleAddProvider(id)}
                        disabled={addingProvider === id}
                        size="sm"
                        className="h-8"
                        variant='outline'
                      >
                        {addingProvider === id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </ModernButton>
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
