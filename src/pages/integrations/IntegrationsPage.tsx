
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsAppIntegration from '@/components/integrations/WhatsAppIntegration';
import SlackIntegration from '@/components/integrations/SlackIntegration';
import InstagramIntegration from '@/components/integrations/InstagramIntegration';
import MessengerIntegration from '@/components/integrations/MessengerIntegration';
import ZapierIntegration from '@/components/integrations/ZapierIntegration';

const IntegrationsPage = () => {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your 7en.ai chatbot to various messaging platforms and services.
        </p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="slack">Slack</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="messenger">Facebook Messenger</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Integration</CardTitle>
              <CardDescription>
                Connect your chatbot with WhatsApp Business API to reach your customers where they are.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppIntegration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slack">
          <Card>
            <CardHeader>
              <CardTitle>Slack Integration</CardTitle>
              <CardDescription>
                Connect your chatbot with Slack to engage with your team and customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlackIntegration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Integration</CardTitle>
              <CardDescription>
                Connect your chatbot with Instagram to respond to DMs automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstagramIntegration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messenger">
          <Card>
            <CardHeader>
              <CardTitle>Facebook Messenger Integration</CardTitle>
              <CardDescription>
                Connect your chatbot with Facebook Messenger to automate customer conversations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessengerIntegration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zapier">
          <Card>
            <CardHeader>
              <CardTitle>Zapier Integration</CardTitle>
              <CardDescription>
                Connect your chatbot with thousands of apps through Zapier automation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ZapierIntegration />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;
