import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import GoogleDriveIntegration from '@/components/integrations/GoogleDriveIntegration';
import { IntegrationStatusBadge } from '@/components/ui/integration-status-badge';
import { ArrowLeft, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initFacebookSDK } from '@/utils/facebookSDK';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useIntegrations } from '@/hooks/useIntegrations';

const IntegrationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    searchParams.get('integration') || null
  );
  const [isFacebookInitialized, setIsFacebookInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [isConnectingGoogleDrive, setIsConnectingGoogleDrive] = useState(false);
  const [isDisconnectingGoogleDrive, setIsDisconnectingGoogleDrive] = useState(false);
  const [showStatusBadge, setShowStatusBadge] = useState(false);
  const [statusBadgeInfo, setStatusBadgeInfo] = useState<{name: string, status: 'success' | 'failed'} | null>(null);
  const { toast } = useToast();

  // Use the centralized integration store
  const {
    integrations,
    isLoading: isLoadingStatuses,
    error,
    getIntegrationStatus,
    updateIntegrationStatus,
    setDefaultProvider: updateDefaultProvider,
    defaultProvider,
    forceRefresh
  } = useIntegrations();

  // Handle integration selection with URL persistence
  const handleIntegrationSelect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    // Update URL parameter to persist selection
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('integration', integrationId);
    setSearchParams(newSearchParams);
    
    // Store the integration being configured in localStorage
    localStorage.setItem('lastConfiguredIntegration', integrationId);
  };

  // Handle going back to integrations list
  const handleBackToIntegrations = () => {
    setSelectedIntegration(null);
    // Remove integration parameter from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('integration');
    setSearchParams(newSearchParams);
  };

  // Check for status and show appropriate badge
  useEffect(() => {
    const status = searchParams.get('status');
    const integrationParam = searchParams.get('integration');
    
    if ((status === 'success' || status === 'failed') && integrationParam) {
      const integration = integrationsList.find(i => i.id === integrationParam);
      if (integration) {
        setStatusBadgeInfo({
          name: integration.name,
          status: status as 'success' | 'failed'
        });
        setShowStatusBadge(true);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setShowStatusBadge(false);
        }, 5000);
        
        // Clean up URL parameter
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('status');
        setSearchParams(newSearchParams);
        
        // Refresh integrations to get updated status
        forceRefresh();
      }
    }
  }, [searchParams, setSearchParams, forceRefresh]);

  const handleStatusBadgeClose = () => {
    setShowStatusBadge(false);
    setStatusBadgeInfo(null);
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

      // Update the store
      updateDefaultProvider(providerId);
      
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

  const handleGoogleDriveConnect = async () => {
    setIsConnectingGoogleDrive(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('auth/google/url/'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to get Google auth URL: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google auth URL response:', result);

      if (result.auth_url) {
        // Redirect to auth URL in the same tab
        window.location.href = result.auth_url;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate Google Drive connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnectingGoogleDrive(false);
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    setIsDisconnectingGoogleDrive(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('drive/unlink/'), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect Google Drive: ${response.status}`);
      }

      const result = await response.json();
      console.log('Google Drive disconnect response:', result);

      // Update the store
      updateIntegrationStatus('google_drive', 'not_connected');

      toast({
        title: "Success",
        description: result.message || "Google Drive disconnected successfully.",
      });
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect Google Drive. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDisconnectingGoogleDrive(false);
    }
  };

  useEffect(() => {
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
  }, [toast]);

  const integrationsList = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Connect your AI Agent with WhatsApp Business API to reach your customers where they are.',
      logo: 'https://img.logo.dev/whatsapp.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('whatsapp'),
      category: 'Messaging',
      type: 'messaging'
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect your AI Agent with Facebook Messenger to automate customer conversations.',
      logo: 'https://img.logo.dev/facebook.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('messenger'),
      category: 'Messaging',
      type: 'messaging'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your AI Agent with Slack to engage with your team and customers.',
      logo: 'https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('slack'),
      category: 'Communication',
      type: 'communication'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your AI Agent with Instagram to respond to DMs automatically.',
      logo: 'https://img.logo.dev/instagram.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('instagram'),
      category: 'Social Media',
      type: 'social'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      logo: 'https://img.logo.dev/zapier.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('zapier'),
      category: 'Automation',
      type: 'automation'
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('zendesk'),
      category: 'Support',
      type: 'ticketing'
    },
    {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/freshdesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('freshdesk'),
      category: 'Support',
      type: 'ticketing'
    },
    {
      id: 'zoho',
      name: 'Zoho Desk',
      description: 'Connect your AI Agent with Zoho Desk to streamline customer support and ticket handling.',
      logo: 'https://img.logo.dev/zoho.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('zoho'),
      category: 'Support',
      type: 'ticketing'
    },
    {
      id: 'salesforce',
      name: 'Salesforce Service Cloud',
      description: 'Connect your AI Agent with Salesforce to enhance customer service and case management.',
      logo: 'https://img.logo.dev/salesforce.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('salesforce'),
      category: 'CRM & Support',
      type: 'ticketing'
    },
    {
      id: 'hubspot',
      name: 'HubSpot Service Hub',
      description: 'Connect your AI Agent with HubSpot to automate customer support and ticketing workflows.',
      logo: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('hubspot'),
      category: 'CRM & Support',
      type: 'ticketing'
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Connect your AI Agent with Google Drive to access and manage your documents and files.',
      logo: 'https://img.logo.dev/google.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: getIntegrationStatus('google_drive'),
      category: 'Storage',
      type: 'storage'
    },
  ];

  const groupedIntegrations = integrationsList.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, typeof integrationsList>);

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
      case 'google_drive':
        return <GoogleDriveIntegration />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getConnectButton = (integration: any) => {
    if (integration.id === 'google_drive') {
      const isConnected = integration.status === 'connected';
      const isLoading = isConnected ? isDisconnectingGoogleDrive : isConnectingGoogleDrive;
      
      return (
        <ModernButton 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
          onClick={isConnected ? handleGoogleDriveDisconnect : handleGoogleDriveConnect}
          disabled={isLoading}
        >
          {isLoading ? (isConnected ? 'Disconnecting...' : 'Connecting...') : (isConnected ? 'Disconnect' : 'Connect')}
        </ModernButton>
      );
    }
    
    // For ticketing integrations, show both Configure and Set as Default buttons
    if (integration.type === 'ticketing' && integration.status === 'connected') {
      return (
        <div className="flex gap-2 flex-wrap">
          <ModernButton 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => handleIntegrationSelect(integration.id)}
          >
            Configure Integration
          </ModernButton>
          {defaultProvider !== integration.id && (
            <ModernButton 
              variant="outline" 
              size="sm"
              className={`w-full sm:w-auto ${
                isSettingDefault === integration.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (isSettingDefault !== integration.id) {
                  handleSetAsDefault(integration.id);
                }
              }}
              disabled={isSettingDefault === integration.id}
            >
              <Star className="h-3 w-3 mr-1" />
              {isSettingDefault === integration.id ? 'Setting...' : 'Set as Default'}
            </ModernButton>
          )}
          {defaultProvider === integration.id && (
            <ModernButton 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
              disabled
            >
              <Star className="h-3 w-3 mr-1 fill-current" />
              Default
            </ModernButton>
          )}
        </div>
      );
    }
    
    return (
      <ModernButton 
        variant="outline" 
        size="sm"
        className="w-full sm:w-auto"
        onClick={() => handleIntegrationSelect(integration.id)}
      >
        Configure Integration
      </ModernButton>
    );
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
      {/* Integration Status Badge */}
      {statusBadgeInfo && (
        <IntegrationStatusBadge
          isVisible={showStatusBadge}
          integrationName={statusBadgeInfo.name}
          status={statusBadgeInfo.status}
          onClose={handleStatusBadgeClose}
        />
      )}

      <div className="container mx-auto py-8 px-4 max-w-5xl pt-12">
        {selectedIntegration ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <ModernButton 
                variant="outline" 
                onClick={handleBackToIntegrations}
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
                    const integration = integrationsList.find(i => i.id === selectedIntegration);
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
                      {category === 'Storage' && 'Connect with cloud storage platforms to access and manage your files and documents.'}
                    </p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                      {categoryIntegrations.map((integration) => (
                        <Card key={integration.id} className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-none hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div 
                                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm flex-shrink-0"
                                style={{
                                  padding: '0',
                                  height: 'auto',
                                  width: 'auto',
                                  borderRadius: '12px',
                                  overflow: 'hidden'
                                }}
                              >
                                <img 
                                  src={integration.logo} 
                                  alt={integration.name}
                                  className="w-12 h-12 object-contain"
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
                                    {integration.name}
                                  </h3>
                                  <div className="flex flex-col gap-1 items-end ml-2 flex-shrink-0">
                                    {getStatusBadge(integration.status)}
                                  </div>
                                </div>
                                
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                                  {integration.description}
                                </p>
                                
                                {getConnectButton(integration)}
                              </div>
                            </div>
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
