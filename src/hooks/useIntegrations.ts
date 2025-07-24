
import { useEffect } from 'react';
import { useIntegrationStore } from '@/store/integrationStore';

// Define the integration metadata
const INTEGRATION_METADATA: Record<string, { name: string; type: string; logo?: string }> = {
  hubspot: { name: 'HubSpot', type: 'ticketing', logo: '/integrations/hubspot.png' },
  zendesk: { name: 'Zendesk', type: 'ticketing', logo: '/integrations/zendesk.png' },
  freshdesk: { name: 'Freshdesk', type: 'ticketing', logo: '/integrations/freshdesk.png' },
  salesforce: { name: 'Salesforce Service Cloud', type: 'ticketing', logo: '/integrations/salesforce.png' },
  zoho: { name: 'Zoho Desk', type: 'ticketing', logo: '/integrations/zoho.png' },
  slack: { name: 'Slack', type: 'communication', logo: '/integrations/slack.png' },
  whatsapp: { name: 'WhatsApp', type: 'communication', logo: '/integrations/whatsapp.png' },
  messenger: { name: 'Messenger', type: 'communication', logo: '/integrations/messenger.png' },
  instagram: { name: 'Instagram', type: 'communication', logo: '/integrations/instagram.png' },
  googledrive: { name: 'Google Drive', type: 'productivity', logo: '/integrations/googledrive.png' },
  zapier: { name: 'Zapier', type: 'automation', logo: '/integrations/zapier.png' }
};

export const useIntegrations = () => {
  const {
    integrations,
    isLoading,
    error,
    fetchIntegrations,
    updateIntegrationStatus,
    setDefaultProvider,
    clearError,
    forceRefresh,
    isDataStale
  } = useIntegrationStore();

  // Auto-fetch on mount if data is stale
  useEffect(() => {
    if (isDataStale()) {
      fetchIntegrations();
    }
  }, [fetchIntegrations, isDataStale]);

  // Get integration status by ID
  const getIntegrationStatus = (id: string) => {
    return integrations[id]?.status || 'not_connected';
  };

  // Get integrations by type
  const getIntegrationsByType = (type: string) => {
    return Object.entries(integrations)
      .filter(([_, integration]) => integration.type === type)
      .map(([id, integration]) => ({
        id,
        ...integration,
        ...INTEGRATION_METADATA[id]
      }))
      .filter(integration => integration.name); // Only include known integrations
  };

  // Get connected ticketing providers (for backward compatibility)
  const getConnectedTicketingProviders = () => {
    return getIntegrationsByType('ticketing')
      .filter(provider => provider.status === 'connected')
      .map(provider => ({
        id: provider.id,
        status: provider.status,
        isDefault: provider.is_default || false,
        type: provider.type
      }));
  };

  // Get default provider
  const getDefaultProvider = () => {
    const ticketingProviders = getIntegrationsByType('ticketing');
    return ticketingProviders.find(provider => provider.is_default)?.id || null;
  };

  return {
    // Data
    integrations,
    isLoading,
    error,
    
    // Computed values
    hasConnectedProviders: Object.values(integrations).some(i => i.status === 'connected'),
    connectedTicketingProviders: getConnectedTicketingProviders(),
    defaultProvider: getDefaultProvider(),
    
    // Methods
    getIntegrationStatus,
    getIntegrationsByType,
    updateIntegrationStatus,
    setDefaultProvider,
    refreshIntegrations: fetchIntegrations,
    forceRefresh,
    clearError
  };
};
