
import { useState, useEffect } from 'react';
import { getAccessToken, getApiUrl } from '@/utils/api-config';

export interface TicketingProvider {
  id: string;
  name: string;
  type: string;
  status: string;
  logo?: string;
  capabilities: {
    priorities: string[];
    customFields?: boolean;
    attachments?: boolean;
  };
}

const TICKETING_PROVIDERS: Record<string, Omit<TicketingProvider, 'id' | 'status'>> = {
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
  const [connectedProviders, setConnectedProviders] = useState<TicketingProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectedProviders = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetch(getApiUrl('integrations/status/'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch integrations: ${response.status}`);
        }

        const integrations = await response.json();
        
        // Filter for connected ticketing providers
        const connectedTicketing = integrations
          .filter((integration: any) => 
            integration.type === 'ticketing' && 
            integration.status === 'connected'
          )
          .map((integration: any) => ({
            id: integration.provider_id,
            status: integration.status,
            ...TICKETING_PROVIDERS[integration.provider_id]
          }))
          .filter((provider: any) => provider.name); // Only include known providers

        setConnectedProviders(connectedTicketing);
      } catch (err) {
        console.error('Error fetching ticketing integrations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch integrations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnectedProviders();
  }, []);

  const refreshIntegrations = () => {
    setError(null);
    fetchConnectedProviders();
  };

  return {
    connectedProviders,
    isLoading,
    error,
    refreshIntegrations,
    hasConnectedProviders: connectedProviders.length > 0
  };
};
