
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { MessageSquare, Slack, Instagram, Link, Phone, Headphones, Ticket, Building2, Cloud, Users } from 'lucide-react';
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
      icon: Phone,
      status: 'not_connected' as const,
      color: 'bg-green-500',
      textColor: 'text-white',
      category: 'Messaging',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your AI Agent with Slack to engage with your team and customers.',
      icon: Slack,
      status: 'not_connected' as const,
      color: 'bg-purple-600',
      textColor: 'text-white',
      category: 'Communication',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your AI Agent with Instagram to respond to DMs automatically.',
      icon: Instagram,
      status: 'not_connected' as const,
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
      textColor: 'text-white',
      category: 'Social Media',
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect your AI Agent with Facebook Messenger to automate customer conversations.',
      icon: MessageSquare,
      status: 'not_connected' as const,
      color: 'bg-blue-600',
      textColor: 'text-white',
      category: 'Messaging',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      icon: Link,
      status: 'not_connected' as const,
      color: 'bg-orange-500',
      textColor: 'text-white',
      category: 'Automation',
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      icon: Headphones,
      status: 'not_connected' as const,
      color: 'bg-teal-600',
      textColor: 'text-white',
      category: 'Support',
    },
    {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      icon: Ticket,
      status: 'not_connected' as const,
      color: 'bg-emerald-500',
      textColor: 'text-white',
      category: 'Support',
    },
    {
      id: 'zoho',
      name: 'Zoho Desk',
      description: 'Connect your AI Agent with Zoho Desk to streamline customer support and ticket handling.',
      icon: Building2,
      status: 'not_connected' as const,
      color: 'bg-red-600',
      textColor: 'text-white',
      category: 'Support',
    },
    {
      id: 'salesforce',
      name: 'Salesforce Service Cloud',
      description: 'Connect your AI Agent with Salesforce to enhance customer service and case management.',
      icon: Cloud,
      status: 'not_connected' as const,
      color: 'bg-blue-500',
      textColor: 'text-white',
      category: 'CRM & Support',
    },
    {
      id: 'hubspot',
      name: 'HubSpot Service Hub',
      description: 'Connect your AI Agent with HubSpot to automate customer support and ticketing workflows.',
      icon: Users,
      status: 'not_connected' as const,
      color: 'bg-orange-600',
      textColor: 'text-white',
      category: 'CRM & Support',
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Integrations</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Connect your 7en.ai chatbot to various messaging platforms and services.
          </p>
        </div>

        {selectedIntegration ? (
          <div className="space-y-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedIntegration(null)}
              className="mb-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-800"
            >
              ← Back to Integrations
            </Button>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50 shadow-xl">
              <CardHeader className="border-b border-slate-200/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/50">
                <div className="flex items-center gap-4">
                  {(() => {
                    const integration = integrations.find(i => i.id === selectedIntegration);
                    const Icon = integration?.icon;
                    return (
                      <>
                        {Icon && (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integration?.color}`}>
                            <Icon className={`h-6 w-6 ${integration?.textColor}`} />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-slate-900 dark:text-slate-100">{integration?.name}</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">{integration?.description}</CardDescription>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white/50 dark:bg-slate-800/50">
                {renderIntegrationComponent(selectedIntegration)}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${integration.color} shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className={`h-7 w-7 ${integration.textColor}`} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-slate-500 border-slate-200 bg-slate-50/80 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-400"
                        >
                          not connected
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1 bg-slate-100/80 dark:bg-slate-700/50 rounded-full">
                          {integration.category}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100 mb-2">{integration.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full font-medium bg-slate-50/80 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setSelectedIntegration(integration.id)}
                    >
                      Configure Integration
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;
