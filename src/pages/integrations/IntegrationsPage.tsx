import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import WhatsAppIntegration from '@/components/integrations/WhatsAppIntegration';
import SlackIntegration from '@/components/integrations/SlackIntegration';
import InstagramIntegration from '@/components/integrations/InstagramIntegration';
import MessengerIntegration from '@/components/integrations/MessengerIntegration';
import ZapierIntegration from '@/components/integrations/ZapierIntegration';
import ZendeskIntegration from '@/components/integrations/ZendeskIntegration';
import FreshdeskIntegration from '@/components/integrations/FreshdeskIntegration';
import ZohoIntegration from '@/components/integrations/ZohoIntegration';
import SalesforceIntegration from '@/components/integrations/SalesforceIntegration';
import HubspotIntegration from '@/components/integrations/HubspotIntegration';
import { ArrowLeft, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initFacebookSDK } from '@/utils/facebookSDK';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';

type IntegrationStatus = 'connected' | 'not_connected' | 'loading';

interface IntegrationStatusData {
  status: string;
  type: string;
  is_default?: boolean;
}

interface IntegrationStatusResponse {
  message: string;
  data: {
    [key: string]: IntegrationStatusData;
  };
  status: string;
}

const IntegrationsPage = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isFacebookInitialized, setIsFacebookInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch integration statuses from API - consolidated into single request
  const fetchIntegrationStatuses = async () => {
    try {
      setIsLoadingStatuses(true);
      const token = getAccessToken();
      if (!token) {
        console.error("No access token available");
        setIsLoadingStatuses(false);
        return;
      }

      const response = await fetch(getApiUrl('integrations-status/'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch integration statuses: ${response.status}`);
      }

      const result: IntegrationStatusResponse = await response.json();
      console.log('Integration statuses fetched:', result);

      // Convert API response to our status format and handle default provider
      const statusMap: Record<string, IntegrationStatus> = {};
      let currentDefaultProvider: string | null = null;

      Object.entries(result.data).forEach(([key, integration]) => {
        statusMap[key] = integration.status as IntegrationStatus;
        
        // Check if this integration is marked as default
        if (integration.is_default && integration.type === 'ticketing' && integration.status === 'connected') {
          currentDefaultProvider = key;
        }
      });

      setIntegrationStatuses(statusMap);
      setDefaultProvider(currentDefaultProvider);
    } catch (error) {
      console.error('Error fetching integration statuses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch integration statuses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  const handleSetAsDefault = async (providerId: string) => {
    setIsSettingDefault(providerId);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('default-ticketing-provider/'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          provider: providerId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to set default provider: ${response.status}`);
      }

      const result = await response.json();
      console.log('Default provider set:', result);

      setDefaultProvider(providerId);
      toast({
        title: "Success",
        description: result.message || "Default ticketing provider updated.",
      });
    } catch (error) {
      console.error('Error setting default provider:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set default provider. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSettingDefault(null);
    }
  };

  useEffect(() => {
    // Initialize Facebook SDK when the integrations page loads - only once
    const initFacebook = async () => {
      try {
        await initFacebookSDK();
        setIsFacebookInitialized(true);
      } catch (error) {
        console.error("Error initializing Facebook SDK:", error);
        toast({
          title: "Facebook SDK Error",
          description: "Failed to initialize Facebook SDK. Some features may not work properly.",
          variant: "destructive"
        });
      } finally {
        setInitialLoadComplete(true);
      }
    };

    if (!initialLoadComplete) {
      initFacebook();
    }

    // Fetch integration statuses - single consolidated request
    fetchIntegrationStatuses();
  }, [toast]);

  const integrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Connect your AI Agent with WhatsApp Business API to reach your customers where they are.',
      logo: 'https://img.logo.dev/whatsapp.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.whatsapp || 'not_connected' as const,
      category: 'Messaging',
      type: 'messaging'
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect your AI Agent with Facebook Messenger to automate customer conversations.',
      logo: 'https://img.logo.dev/facebook.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.messenger || 'not_connected' as const,
      category: 'Messaging',
      type: 'messaging'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your AI Agent with Slack to engage with your team and customers.',
      logo: 'https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.slack || 'not_connected' as const,
      category: 'Communication',
      type: 'communication'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your AI Agent with Instagram to respond to DMs automatically.',
      logo: 'https://img.logo.dev/instagram.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.instagram || 'not_connected' as const,
      category: 'Social Media',
      type: 'social'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      logo: 'https://img.logo.dev/zapier.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.zapier || 'not_connected' as const,
      category: 'Automation',
      type: 'automation'
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.zendesk || 'not_connected' as const,
      category: 'Support',
      type: 'ticketing'
    },
    {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/freshworks.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.freshdesk || 'not_connected' as const,
      category: 'Support',
      type: 'ticketing'
    },
    {
      id: 'zoho',
      name: 'Zoho Desk',
      description: 'Connect your AI Agent with Zoho Desk to streamline customer support and ticket handling.',
      logo: 'https://img.logo.dev/zoho.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.zoho || 'not_connected' as const,
      category: 'Support',
      type: 'ticketing'
    },
    {
      id: 'salesforce',
      name: 'Salesforce Service Cloud',
      description: 'Connect your AI Agent with Salesforce to enhance customer service and case management.',
      logo: 'https://img.logo.dev/salesforce.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.salesforce || 'not_connected' as const,
      category: 'CRM & Support',
      type: 'ticketing'
    },
    {
      id: 'hubspot',
      name: 'HubSpot Service Hub',
      description: 'Connect your AI Agent with HubSpot to automate customer support and ticketing workflows.',
      logo: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: integrationStatuses.hubspot || 'not_connected' as const,
      category: 'CRM & Support',
      type: 'ticketing'
    },
  ];

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, typeof integrations>);

  const renderIntegrationComponent = (integrationId: string) => {
    switch (integrationId) {
      case 'whatsapp':
        return <WhatsAppIntegration shouldCheckStatus={initialLoadComplete} />;
      case 'slack':
        return <SlackIntegration />;
      case 'instagram':
        return <InstagramIntegration />;
      case 'messenger':
        return <MessengerIntegration />;
      case 'zapier':
        return <ZapierIntegration />;
      case 'zendesk':
        return <ZendeskIntegration />;
      case 'freshdesk':
        return <FreshdeskIntegration />;
      case 'zoho':
        return <ZohoIntegration />;
      case 'salesforce':
        return <SalesforceIntegration />;
      case 'hubspot':
        return <HubspotIntegration />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    if (status === 'connected') {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          Connected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-400">
        Not connected
      </Badge>
    );
  };

  const getDefaultBadge = (integrationId: string) => {
    if (defaultProvider === integrationId) {
      return (
        <Badge 
          variant="outline" 
          className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 cursor-pointer"
          onClick={() => handleSetAsDefault(integrationId)}
        >
          <Star className="h-3 w-3 mr-1 fill-current" />
          Default
        </Badge>
      );
    }
    
    // For connected ticketing providers that are not default, show clickable badge
    if (integrationId !== defaultProvider) {
      return (
        <Badge 
          variant="outline" 
          className={`text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/30 ${
            isSettingDefault === integrationId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => {
            if (isSettingDefault !== integrationId) {
              handleSetAsDefault(integrationId);
            }
          }}
        >
          <Star className="h-3 w-3 mr-1" />
          {isSettingDefault === integrationId ? 'Setting...' : 'Set as Default'}
        </Badge>
      );
    }
    
    return null;
  };

  if (isLoadingStatuses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto py-8 px-4 max-w-5xl pt-12">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading integrations..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-5xl pt-12">
        {selectedIntegration ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <ModernButton 
                variant="outline" 
                onClick={() => setSelectedIntegration(null)}
                icon={ArrowLeft}
                className="shadow-sm"
              >
                Back to Integrations
              </ModernButton>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const integration = integrations.find(i => i.id === selectedIntegration);
                    return (
                      <>
                        <div 
                          className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm"
                          style={{
                            padding: '0',
                            height: 'auto',
                            width: 'auto',
                            borderRadius: '14px',
                            overflow: 'hidden'
                          }}
                        >
                          <img 
                            src={integration?.logo} 
                            alt={integration?.name}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {integration?.name}
                          </h1>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {integration?.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {integration && getStatusBadge(integration.status)}
                          {integration && integration.type === 'ticketing' && integration.status === 'connected' && getDefaultBadge(integration.id)}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="p-8">
                {renderIntegrationComponent(selectedIntegration)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            <div className="space-y-8">
              {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
                <section key={category} className="space-y-6">
                  <div className="mb-6 pl-2">
                    <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{category}</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {category === 'Messaging' && 'Connect with popular messaging platforms to reach your customers where they are.'}
                      {category === 'Communication' && 'Integrate with communication tools to streamline team collaboration.'}
                      {category === 'Social Media' && 'Connect with social media platforms to automate customer interactions.'}
                      {category === 'Automation' && 'Connect with automation tools to create powerful workflows.'}
                      {category === 'Support' && 'Integrate with customer support platforms to enhance your helpdesk operations.'}
                      {category === 'CRM & Support' && 'Connect with CRM and enterprise support platforms for comprehensive customer management.'}
                    </p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryIntegrations.map((integration) => (
                        <Card key={integration.id} className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-none">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between mb-4">
                              <div 
                                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
                                style={{
                                  padding: '0',
                                  height: 'auto',
                                  width: 'auto',
                                  borderRadius: '14px',
                                  overflow: 'hidden'
                                }}
                              >
                                <img 
                                  src={integration.logo} 
                                  alt={integration.name}
                                  className="w-16 h-16 object-contain"
                                />
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                {getStatusBadge(integration.status)}
                                {integration.type === 'ticketing' && integration.status === 'connected' && getDefaultBadge(integration.id)}
                              </div>
                            </div>
                            <CardTitle className="font-medium text-base text-slate-900 dark:text-slate-100 mb-2">
                              {integration.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            <ModernButton 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setSelectedIntegration(integration.id)}
                            >
                              Configure Integration
                            </ModernButton>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;
