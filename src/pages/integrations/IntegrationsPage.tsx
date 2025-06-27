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
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initFacebookSDK } from '@/utils/facebookSDK';

const IntegrationsPage = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isFacebookInitialized, setIsFacebookInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { toast } = useToast();

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
  }, [toast, initialLoadComplete]);

  const integrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Connect your AI Agent with WhatsApp Business API to reach your customers where they are.',
      logo: 'https://img.logo.dev/whatsapp.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Messaging',
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect your AI Agent with Facebook Messenger to automate customer conversations.',
      logo: 'https://img.logo.dev/facebook.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Messaging',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your AI Agent with Slack to engage with your team and customers.',
      logo: 'https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Communication',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your AI Agent with Instagram to respond to DMs automatically.',
      logo: 'https://img.logo.dev/instagram.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Social Media',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      logo: 'https://img.logo.dev/zapier.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Automation',
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Support',
    },
    {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/freshworks.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Support',
    },
    {
      id: 'zoho',
      name: 'Zoho Desk',
      description: 'Connect your AI Agent with Zoho Desk to streamline customer support and ticket handling.',
      logo: 'https://img.logo.dev/zoho.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'Support',
    },
    {
      id: 'salesforce',
      name: 'Salesforce Service Cloud',
      description: 'Connect your AI Agent with Salesforce to enhance customer service and case management.',
      logo: 'https://img.logo.dev/salesforce.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'CRM & Support',
    },
    {
      id: 'hubspot',
      name: 'HubSpot Service Hub',
      description: 'Connect your AI Agent with HubSpot to automate customer support and ticketing workflows.',
      logo: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      status: 'not_connected' as const,
      category: 'CRM & Support',
    },
  ];

  // Group integrations by category
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-6 max-w-7xl">
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
                        <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-400">
                          Not Connected
                        </Badge>
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
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Integrations
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Connect your 7en.ai chatbot to various messaging platforms and services to streamline your workflow.
              </p>
            </div>

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
                        <Card key={integration.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 group">
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
                              <Badge 
                                variant="outline" 
                                className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-400"
                              >
                                not connected
                              </Badge>
                            </div>
                            <CardTitle className="text-xl text-slate-900 dark:text-slate-100 mb-2">
                              {integration.name}
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {integration.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <ModernButton 
                              variant="outline" 
                              className="w-full shadow-sm"
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
