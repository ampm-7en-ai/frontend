
import { useIntegrations } from './useIntegrations';

export interface TicketingProvider {
  id: string;
  name: string;
  type: string;
  status: string;
  isDefault?: boolean;
  logo?: string;
  capabilities: {
    priorities: string[];
    customFields?: boolean;
    attachments?: boolean;
  };
}

export const TICKETING_PROVIDERS: Record<string, Omit<TicketingProvider, 'id' | 'status' | 'isDefault'>> = {
  hubspot: {
    name: 'HubSpot',
    type: 'ticketing',
    logo: '/integrations/hubspot.png',
    capabilities: {
      priorities: ['LOW', 'MEDIUM', 'HIGH'],
      customFields: true,
      attachments: false
    }
  },
  zendesk: {
    name: 'Zendesk',
    type: 'ticketing',
    logo: '/integrations/zendesk.png',
    capabilities: {
      priorities: ['low', 'normal', 'high', 'urgent'],
      customFields: true,
      attachments: true
    }
  },
  freshdesk: {
    name: 'Freshdesk',
    type: 'ticketing',
    logo: '/integrations/freshdesk.png',
    capabilities: {
      priorities: ['1', '2', '3', '4'], // 1=Low, 2=Medium, 3=High, 4=Urgent
      customFields: true,
      attachments: true
    }
  },
  zoho: {
    name: 'Zoho Desk',
    type: 'ticketing',
    logo: '/integrations/zoho.png',
    capabilities: {
      priorities: ['Low', 'Medium', 'High', 'Urgent'],
      customFields: true,
      attachments: true
    }
  },
  salesforce: {
    name: 'Salesforce Service Cloud',
    type: 'ticketing',
    logo: '/integrations/salesforce.png',
    capabilities: {
      priorities: ['Low', 'Medium', 'High', 'Critical'],
      customFields: true,
      attachments: true
    }
  }
};

export const useTicketingIntegrations = () => {
  const { 
    connectedTicketingProviders, 
    isLoading, 
    error, 
    forceRefresh 
  } = useIntegrations();

  // Transform the data to match the old interface
  const connectedProviders: TicketingProvider[] = connectedTicketingProviders
    .map(provider => ({
      id: provider.id,
      status: provider.status,
      isDefault: provider.isDefault || false,
      ...TICKETING_PROVIDERS[provider.id]
    }))
    .filter((provider: any) => provider.name); // Only include known providers

  return {
    connectedProviders,
    isLoading,
    error,
    refreshIntegrations: forceRefresh,
    hasConnectedProviders: connectedProviders.length > 0
  };
};
