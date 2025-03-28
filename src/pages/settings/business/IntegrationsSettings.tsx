
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Link, Slack, MessageSquare, FileText, ShoppingCart, Lock, Mail, Database, Github, Box, Smartphone, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Link your Slack workspace',
    longDescription: 'Connect your Slack workspace to send and receive messages.',
    icon: Slack,
    connected: true,
    isPremium: false,
    iconColor: '#4A154B',
  },
  {
    id: 'messenger',
    name: 'Messenger',
    category: 'communication',
    description: 'Connect with Facebook Messenger',
    longDescription: 'Connect with Facebook Messenger for customer conversations.',
    icon: MessageSquare,
    connected: false,
    isPremium: false,
    iconColor: '#0084FF',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'communication',
    description: 'Connect your WhatsApp Business account',
    longDescription: 'Integrate with WhatsApp for direct customer messaging.',
    icon: Smartphone,
    connected: false,
    isPremium: false,
    iconColor: '#25D366',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'communication',
    description: 'Connect to Instagram direct messages',
    longDescription: 'Connect to Instagram to respond to direct messages.',
    icon: Instagram,
    connected: false,
    isPremium: false,
    iconColor: '#E1306C',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'helpdesk',
    description: 'Sync tickets and customer information',
    longDescription: 'Sync tickets and customer information with Zendesk.',
    icon: FileText,
    connected: false,
    isPremium: true,
    iconColor: '#03363D',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    description: 'Connect your Shopify store',
    longDescription: 'Connect your Shopify store to assist with product queries.',
    icon: ShoppingCart,
    connected: false,
    isPremium: false,
    iconColor: '#96BF47',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    description: 'Connect to GitHub repositories',
    longDescription: 'Connect to GitHub repositories for documentation access.',
    icon: Github,
    connected: false,
    isPremium: false,
    iconColor: '#181717',
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'authentication',
    description: 'Implement secure authentication',
    longDescription: 'Implement Auth0 for secure authentication.',
    icon: Lock,
    connected: false,
    isPremium: true,
    iconColor: '#EB5424',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    description: 'Integrate with email marketing',
    longDescription: 'Integrate with Mailchimp for email marketing.',
    icon: Mail,
    connected: false,
    isPremium: false,
    iconColor: '#FFE01B',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'database',
    description: 'Connect as a knowledge source',
    longDescription: 'Connect Airtable as a knowledge source.',
    icon: Database,
    connected: false,
    isPremium: false,
    iconColor: '#18BFFF',
  },
];

const IntegrationsSettings = () => {
  const [activeIntegrations, setActiveIntegrations] = useState(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('slack');
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

  const handleToggleConnection = (id: string) => {
    const updatedIntegrations = activeIntegrations.map(item => 
      item.id === id ? {...item, connected: !item.connected} : item
    );
    setActiveIntegrations(updatedIntegrations);

    const integration = activeIntegrations.find(item => item.id === id);
    if (integration) {
      toast({
        title: integration.connected ? "Disconnected" : "Connected",
        description: `${integration.name} has been ${integration.connected ? "disconnected" : "connected"} successfully.`
      });
    }
  };

  const renderIntegrationCard = (integration: typeof integrations[0]) => {
    return (
      <Card 
        key={integration.id} 
        className={cn(
          "overflow-hidden cursor-pointer transition-all mb-2 hover:border-primary/50 hover:shadow-sm",
          selectedIntegration === integration.id ? 'border-primary ring-1 ring-primary/20' : ''
        )}
        onClick={() => handleIntegrationSelect(integration.id)}
      >
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <integration.icon 
                className="h-5 w-5" 
                style={{ color: integration.iconColor }}
              />
            </div>
            <div>
              <p className="font-medium text-sm">{integration.name}</p>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <div className="flex items-center">
            {integration.connected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                Connected
              </Badge>
            ) : integration.isPremium ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                Premium
              </Badge>
            ) : (
              <Switch 
                checked={integration.connected} 
                onCheckedChange={() => handleToggleConnection(integration.id)}
                onClick={(e) => e.stopPropagation()}
                className="scale-75"
              />
            )}
          </div>
        </div>
      </Card>
    );
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
            <integration.icon className="h-10 w-10" style={{ color: integration.iconColor }} />
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

    if (integration.id === 'messenger') {
      return (
        <div className="space-y-6 p-6">
          <div className="flex items-start gap-4">
            <integration.icon className="h-10 w-10" style={{ color: integration.iconColor }} />
            <div>
              <h2 className="text-2xl font-semibold mb-1">Facebook Messenger Integration</h2>
              <p className="text-muted-foreground">
                Connect your Facebook Page to engage with customers through Messenger.
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="page-id">Facebook Page ID</Label>
              <Input 
                id="page-id" 
                placeholder="Enter your Facebook Page ID"
              />
              <p className="text-xs text-muted-foreground">
                You can find your Page ID in your Facebook Page settings.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="page-access-token">Page Access Token</Label>
              <Input 
                id="page-access-token" 
                type="password"
                placeholder="Enter your Page Access Token"
              />
              <p className="text-xs text-muted-foreground">
                Generate this token in your Facebook Developer account.
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

            <Button className="mt-4">
              Connect Messenger
            </Button>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium">What you can do with Messenger integration:</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Respond to customer inquiries automatically</li>
              <li>Hand off complex conversations to human agents</li>
              <li>Send proactive notifications about order updates</li>
              <li>Create personalized customer experiences</li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <integration.icon className="h-10 w-10" style={{ color: integration.iconColor }} />
          <div>
            <h2 className="text-2xl font-semibold mb-1">{integration.name} Integration</h2>
            <p className="text-muted-foreground">
              {integration.longDescription}
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

          <div className="space-y-2">
            <Label htmlFor={`${integration.id}-endpoint`}>API Endpoint (Optional)</Label>
            <Input 
              id={`${integration.id}-endpoint`} 
              placeholder="https://api.example.com"
            />
          </div>

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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect your agent with other platforms to extend its capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                {activeIntegrations
                  .filter(integration => integration.category === 'communication')
                  .map(renderIntegrationCard)}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Other Integrations</h3>
                <div className="flex flex-col space-y-1">
                  {activeIntegrations
                    .filter(integration => integration.category !== 'communication')
                    .map(renderIntegrationCard)}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                {renderSelectedIntegration()}
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsSettings;
