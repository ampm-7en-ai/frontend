
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Slack, MessageSquare, FileText, ShoppingCart, Lock, Mail, Database, Github, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Connect your Slack workspace to send and receive messages.',
    icon: Slack,
    connected: false,
    isPremium: false,
  },
  {
    id: 'messenger',
    name: 'Messenger',
    category: 'communication',
    description: 'Connect with Facebook Messenger for customer conversations.',
    icon: MessageSquare,
    connected: false,
    isPremium: false,
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: 'communication',
    description: 'Integrate with Intercom for customer support conversations.',
    icon: MessageSquare,
    connected: false,
    isPremium: false,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'helpdesk',
    description: 'Sync tickets and customer information with Zendesk.',
    icon: FileText,
    connected: false,
    isPremium: true,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    description: 'Connect your Shopify store to assist with product queries.',
    icon: ShoppingCart,
    connected: false,
    isPremium: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    description: 'Connect to GitHub repositories for documentation access.',
    icon: Github,
    connected: false,
    isPremium: false,
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'authentication',
    description: 'Implement Auth0 for secure authentication.',
    icon: Lock,
    connected: false,
    isPremium: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    description: 'Integrate with Mailchimp for email marketing.',
    icon: Mail,
    connected: false,
    isPremium: false,
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'database',
    description: 'Connect Airtable as a knowledge source.',
    icon: Database,
    connected: false,
    isPremium: false,
  },
];

const IntegrationsSettings = () => {
  const [activeIntegrations, setActiveIntegrations] = useState(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleIntegrationSelect = (id: string) => {
    setSelectedIntegration(id);
  };

  const getSelectedIntegration = () => {
    return activeIntegrations.find(integration => integration.id === selectedIntegration) || null;
  };

  const handleConnect = () => {
    toast({
      title: "Redirecting to authentication",
      description: "You'll be redirected to authenticate with the selected service."
    });
  };

  const renderIntegrationCards = (category: string) => {
    return activeIntegrations
      .filter(integration => integration.category === category)
      .map(integration => (
        <Card 
          key={integration.id} 
          className={`overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${selectedIntegration === integration.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
          onClick={() => handleIntegrationSelect(integration.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-2 rounded-md">
                  <integration.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  {integration.isPremium && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
              <Switch 
                checked={integration.connected} 
                onCheckedChange={() => {
                  const updatedIntegrations = activeIntegrations.map(item => 
                    item.id === integration.id ? {...item, connected: !item.connected} : item
                  );
                  setActiveIntegrations(updatedIntegrations);
                  if (!integration.connected) {
                    setSelectedIntegration(integration.id);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{integration.description}</p>
          </CardContent>
          <CardFooter className="bg-muted/40 border-t pt-2 pb-2 px-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIntegration(integration.id);
              }}
            >
              Configure
            </Button>
          </CardFooter>
        </Card>
      ));
  };

  const renderSelectedIntegration = () => {
    const integration = getSelectedIntegration();
    
    if (!integration) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
          <Box className="h-16 w-16 mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Select an integration</h3>
          <p className="max-w-md">
            Choose an integration from the left to configure and connect it to your agent.
          </p>
        </div>
      );
    }

    if (integration.id === 'slack') {
      return (
        <div className="space-y-6 p-6">
          <div className="flex items-start gap-4">
            <integration.icon className="h-10 w-10 text-[#4A154B]" />
            <div>
              <h2 className="text-2xl font-semibold mb-1">Slack Integration</h2>
              <p className="text-muted-foreground">
                Install Coco 2 to your Slack workspace and start chatting with it within Slack!
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Button className="flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack logo" className="h-5 w-5" />
              Add to your Slack workspace
            </Button>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium">What you can do with Slack integration:</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Chat with your AI assistant directly in Slack</li>
                <li>Answer questions based on your knowledge base</li>
                <li>Get notified about important events</li>
                <li>Connect with your team members seamlessly</li>
              </ul>
            </div>

            <div className="mt-8 bg-muted/50 p-4 rounded-lg border">
              <h3 className="text-sm font-medium mb-2">Permissions requested:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Send messages as the app</li>
                <li>• View messages in channels the app is added to</li>
                <li>• Access basic information about the workspace</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <integration.icon className="h-10 w-10 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold mb-1">{integration.name} Integration</h2>
            <p className="text-muted-foreground">
              {integration.description}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <div className="space-y-2">
            <Label htmlFor={`${integration.id}-api-key`}>API Key or Token</Label>
            <Input 
              id={`${integration.id}-api-key`} 
              type="password" 
              placeholder="Enter your API key"
            />
          </div>

          {integration.id === 'messenger' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="page-id">Facebook Page ID</Label>
                <Input 
                  id="page-id" 
                  placeholder="Enter your Facebook Page ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-access-token">Page Access Token</Label>
                <Input 
                  id="page-access-token" 
                  type="password"
                  placeholder="Enter your Page Access Token"
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your Facebook Developer account.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="callback-url">Webhook Callback URL</Label>
                <Input 
                  id="callback-url"
                  value="https://api.example.com/webhooks/messenger"
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Use this URL in your Facebook app's webhook settings.
                </p>
              </div>
            </>
          )}

          <Button className="mt-4" onClick={handleConnect}>
            Connect {integration.name}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Integrations</h2>
        <Button asChild variant="outline">
          <a href="https://docs.example.com/integrations" target="_blank" rel="noopener noreferrer">
            <Link className="h-4 w-4 mr-2" />
            Integration Docs
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Tabs defaultValue="communication">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            
            <TabsContent value="communication" className="space-y-4">
              {renderIntegrationCards('communication')}
            </TabsContent>
            
            <TabsContent value="other" className="space-y-4">
              {activeIntegrations
                .filter(integration => integration.category !== 'communication')
                .map(integration => (
                  <Card 
                    key={integration.id} 
                    className={`overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${selectedIntegration === integration.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
                    onClick={() => handleIntegrationSelect(integration.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <integration.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            {integration.isPremium && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Switch 
                          checked={integration.connected} 
                          onCheckedChange={() => {
                            const updatedIntegrations = activeIntegrations.map(item => 
                              item.id === integration.id ? {...item, connected: !item.connected} : item
                            );
                            setActiveIntegrations(updatedIntegrations);
                            if (!integration.connected) {
                              setSelectedIntegration(integration.id);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </CardContent>
                    <CardFooter className="bg-muted/40 border-t pt-2 pb-2 px-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIntegration(integration.id);
                        }}
                      >
                        Configure
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Custom Integrations</CardTitle>
              <CardDescription>Connect custom services using our API and webhooks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="bg-muted p-3 rounded-lg">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Custom Webhook Integration</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Integrate with any custom service using our webhook API.
                  </p>
                </div>
                <Button className="ml-auto" variant="outline" size="sm">
                  Set Up Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            {renderSelectedIntegration()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
