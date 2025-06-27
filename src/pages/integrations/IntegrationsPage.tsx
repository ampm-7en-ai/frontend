
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
import { MessageSquare, Slack, Instagram, Link, Phone, Headphones, Ticket } from 'lucide-react';
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
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your AI Agent with Slack to engage with your team and customers.',
      icon: Slack,
      status: 'not_connected' as const,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your AI Agent with Instagram to respond to DMs automatically.',
      icon: Instagram,
      status: 'not_connected' as const,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect your AI Agent with Facebook Messenger to automate customer conversations.',
      icon: MessageSquare,
      status: 'not_connected' as const,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      icon: Link,
      status: 'not_connected' as const,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      icon: Headphones,
      status: 'not_connected' as const,
      color: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      icon: Ticket,
      status: 'not_connected' as const,
      color: 'bg-rose-100 text-rose-600',
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
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your 7en.ai chatbot to various messaging platforms and services.
        </p>
      </div>

      {selectedIntegration ? (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedIntegration(null)}
            className="mb-4"
          >
            ← Back to Integrations
          </Button>
          
          <Card className="border shadow-lg">
            <CardHeader className="border-b bg-muted/40">
              <div className="flex items-center gap-3">
                {(() => {
                  const integration = integrations.find(i => i.id === selectedIntegration);
                  const Icon = integration?.icon;
                  return (
                    <>
                      {Icon && <Icon className="h-6 w-6" />}
                      <div>
                        <CardTitle>{integration?.name}</CardTitle>
                        <CardDescription>{integration?.description}</CardDescription>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {renderIntegrationComponent(selectedIntegration)}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-slate-500 border-slate-200 bg-slate-50"
                    >
                      not connected
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full font-medium"
                    onClick={() => setSelectedIntegration(integration.id)}
                  >
                    View integration
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
