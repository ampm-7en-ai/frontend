
import { useEffect } from 'react';
import { useIntegrationStore } from '@/store/integrationStore';

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
    console.log('Getting integrations by type:', type);
    console.log('All integrations:', integrations);
    
    const filtered = Object.entries(integrations)
      .filter(([_, integration]) => integration.type === type)
      .map(([id, integration]) => ({ id, ...integration }));
    
    console.log('Filtered integrations for type', type, ':', filtered);
    return filtered;
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

  // Debug all integrations
  console.log('useIntegrations - All integrations:', integrations);
  console.log('useIntegrations - Has connected providers:', Object.values(integrations).some(i => i.status === 'connected'));

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
