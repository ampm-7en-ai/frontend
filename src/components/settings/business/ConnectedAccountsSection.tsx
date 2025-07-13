
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import { useIntegrations } from '@/hooks/useIntegrations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAccessToken, getApiUrl } from '@/utils/api-config';
import { toast } from '@/hooks/use-toast';
import { Unplug } from 'lucide-react';

const INTEGRATION_LOGOS: Record<string, string> = {
  slack: 'https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
  hubspot: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
  zendesk: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
  freshdesk: 'https://img.logo.dev/freshworks.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
  zoho: 'https://img.logo.dev/zoho.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
  salesforce: 'https://img.logo.dev/salesforce.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
};

const PROVIDER_NAMES: Record<string, string> = {
  hubspot: 'HubSpot Service Hub',
  zendesk: 'Zendesk',
  freshdesk: 'Freshdesk',
  zoho: 'Zoho Desk',
  salesforce: 'Salesforce Service Cloud'
};

const ConnectedAccountsSection = () => {
  const { 
    connectedTicketingProviders, 
    isLoading, 
    error, 
    forceRefresh,
    updateIntegrationStatus 
  } = useIntegrations();
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);

  const handleDisconnect = async (providerId: string, providerName: string) => {
    try {
      setDisconnectingProvider(providerId);
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(`integrations/${providerId}/disconnect/`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${providerName}`);
      }

      toast({
        title: "Integration disconnected",
        description: `${providerName} has been successfully disconnected.`,
      });

      // Update the store
      updateIntegrationStatus(providerId, 'not_connected');
      
      // Force refresh to ensure consistency
      forceRefresh();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: "Error disconnecting integration",
        description: error instanceof Error ? error.message : `Failed to disconnect ${providerName}`,
        variant: "destructive",
      });
    } finally {
      setDisconnectingProvider(null);
    }
  };

  if (isLoading) {
    return (
      <section className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100 pl-2">Connected Accounts</h2>
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Loading integrations..." />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100 pl-2">Connected Accounts</h2>
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <p className="font-medium">Error loading integrations</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (connectedTicketingProviders.length === 0) {
    return (
      <section className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100 pl-2">Connected Accounts</h2>
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            <p className="text-lg font-medium mb-2">No connected accounts</p>
            <p className="text-sm">Connect integrations from the Integrations page to see them here.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100 pl-2">Connected Accounts</h2>
      <div className="space-y-4">
        {connectedTicketingProviders.map((provider) => (
          <div key={provider.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200/50 dark:border-slate-600/50">
                  <img 
                    src={INTEGRATION_LOGOS[provider.id]} 
                    alt={`${PROVIDER_NAMES[provider.id]} logo`}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{PROVIDER_NAMES[provider.id]}</h3>
                  <Badge className="bg-green-50 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    connected
                  </Badge>
                  {provider.isDefault && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                      default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {PROVIDER_NAMES[provider.id]} integration is active and ready to create support tickets.
                </p>
              </div>
              <div className="flex-shrink-0">
                <ModernButton 
                  variant="outline" 
                  onClick={() => handleDisconnect(provider.id, PROVIDER_NAMES[provider.id])}
                  disabled={disconnectingProvider === provider.id}
                  icon={disconnectingProvider === provider.id ? undefined : Unplug}
                  className="font-medium text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  {disconnectingProvider === provider.id ? 'Disconnecting...' : 'Disconnect'}
                </ModernButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ConnectedAccountsSection;
